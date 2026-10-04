package com.fast_food.service;

import com.fast_food.dto.ChangerStatusCommandeRequest;
import com.fast_food.dto.CreerCommandeRequest;
import com.fast_food.dto.CommandeResponse;
import com.fast_food.entite.Commande;
import com.fast_food.entite.CommandeItemOption;
import com.fast_food.entite.CommandeMenu;
import com.fast_food.entite.OptionItem;
import com.fast_food.entite.Panier;
import com.fast_food.entite.PanierItem;
import com.fast_food.entite.PanierItemOption;
import com.fast_food.entite.ProduitMenu;
import com.fast_food.entite.Recette;
import com.fast_food.entite.User;
import com.fast_food.exception.ResourceNotFoundException;
import com.fast_food.mapper.CommandeMapper;
import com.fast_food.repositorie.CommandeRepository;
import com.fast_food.repositorie.PanierRepository;
import com.fast_food.repositorie.RecetteRepository;
import com.fast_food.repositorie.StockMatierePremiereRepository;
import com.fast_food.repositorie.UserRepository;
import com.fast_food.exception.AccessDeniedException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommandeService {

    private final CommandeRepository commandeRepository;
    private final PanierRepository panierRepository;
    private final UserRepository userRepository;

    private final PanierService panierService;
    private final CommandeMapper commandeMapper;
    private final EmailService emailService;

    private final RecetteRepository recetteRepository;
    private final StockMatierePremiereRepository stockRepository;

    @Transactional
    public CommandeResponse passerCommande(User user, CreerCommandeRequest request) {
        // 0. Validation du type de retrait
        Commande.TypeRetrait typeRetrait;
        try {
            typeRetrait = Commande.TypeRetrait.valueOf(request.getTypeRetrait().toLowerCase());
        } catch (Exception e) {
            throw new IllegalArgumentException("Type de retrait invalide : " + request.getTypeRetrait());
        }

        if (typeRetrait == Commande.TypeRetrait.livraison) {
            if (request.getCpRue() == null || request.getCpRue().isBlank()
                    || request.getCpVille() == null || request.getCpVille().isBlank()
                    || request.getCpCodePostal() == null || request.getCpCodePostal().isBlank()) {
                throw new IllegalArgumentException("L'adresse est obligatoire pour une livraison.");
            }
            if (!request.getCpCodePostal().matches("^[0-9]{5}$")) {
                throw new IllegalArgumentException("Le code postal doit contenir exactement 5 chiffres.");
            }
        }

        // 1. Récupération du panier
        Panier panier = panierRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Aucun panier trouvé pour cet utilisateur."));
        if (panier.getPanierContenu() == null || panier.getPanierContenu().isEmpty()) {
            throw new IllegalArgumentException("Votre panier est vide. Impossible de passer la commande.");
        }

        // 2. Déstockage atomique (Recette de base + Options)
        for (PanierItem item : panier.getPanierContenu()) {
            ProduitMenu produit = item.getProduitMenu();

            if (Boolean.FALSE.equals(produit.isEstDispo())) {
                throw new IllegalArgumentException("Le produit '" + produit.getNom() + "' n'est plus disponible au menu.");
            }

            // 2.a. Déstockage des ingrédients de la recette de base
            List<Recette> recettes = recetteRepository.findByProduitMenu(produit);
            for (Recette recette : recettes) {
                BigDecimal quantiteNecessaire = recette.getQuantiteRequise()
                        .multiply(BigDecimal.valueOf(item.getQuantite()));

                int updated = stockRepository.decrementStock(recette.getMatierePremiere().getId(), quantiteNecessaire);
                if (updated == 0) {
                    throw new IllegalArgumentException("Stock insuffisant pour " + recette.getMatierePremiere().getNom());
                }
            }

            // 2.b. Déstockage des matières premières liées aux options choisies
            if (item.getOptions() != null) {
                for (PanierItemOption pio : item.getOptions()) {
                    OptionItem option = pio.getOptionItem();
                    if (option.getMatierePremiere() != null && option.getQuantiteDeduite() != null) {
                        BigDecimal qteOptionTotale = option.getQuantiteDeduite()
                                .multiply(BigDecimal.valueOf(item.getQuantite()));

                        int updatedOpt = stockRepository.decrementStock(option.getMatierePremiere().getId(), qteOptionTotale);
                        if (updatedOpt == 0) {
                            throw new IllegalArgumentException("Stock insuffisant pour l'option : " + option.getNom());
                        }
                    }
                }
            }
        }

        // 3. Création de la commande
        Commande commande = new Commande();
        commande.setUser(user);
        commande.setTypeRetrait(typeRetrait);
        commande.setStatus(Commande.Status.en_attente);

        if (typeRetrait == Commande.TypeRetrait.livraison) {
            commande.setCpRue(request.getCpRue());
            commande.setCpVille(request.getCpVille());
            commande.setCpCodePostal(request.getCpCodePostal());
        }

        commande.setDateCreation(LocalDateTime.now());

        BigDecimal totalCommande = BigDecimal.ZERO;
        List<CommandeMenu> itemsCommande = new ArrayList<>();

        for (PanierItem item : panier.getPanierContenu()) {
            BigDecimal prixUnitaireProduit = item.getProduitMenu().getPrix();
            BigDecimal surcoutOptions = BigDecimal.ZERO;

            List<CommandeItemOption> optionsCommande = new ArrayList<>();

            // Traitement et historisation des options
            if (item.getOptions() != null) {
                for (PanierItemOption pio : item.getOptions()) {
                    OptionItem opt = pio.getOptionItem();
                    surcoutOptions = surcoutOptions.add(opt.getSurcout() != null ? opt.getSurcout() : BigDecimal.ZERO);

                    CommandeItemOption cio = new CommandeItemOption();
                    cio.setOptionItem(opt);
                    cio.setNomOption(opt.getNom());
                    cio.setSurcout(opt.getSurcout());
                    optionsCommande.add(cio);
                }
            }

            BigDecimal prixTotalUnitaireItem = prixUnitaireProduit.add(surcoutOptions);
            BigDecimal sousTotalItem = prixTotalUnitaireItem.multiply(BigDecimal.valueOf(item.getQuantite()));
            totalCommande = totalCommande.add(sousTotalItem);

            CommandeMenu commandeMenu = new CommandeMenu();
            commandeMenu.setCommandeInfo(commande);
            commandeMenu.setProduitMenu(item.getProduitMenu());
            commandeMenu.setQuantite(item.getQuantite());
            commandeMenu.setPrix(prixTotalUnitaireItem);

            // Liaison bi-directionnelle avec les options historisées
            for (CommandeItemOption cio : optionsCommande) {
                cio.setCommandeMenu(commandeMenu);
            }
            commandeMenu.setOptions(optionsCommande);

            itemsCommande.add(commandeMenu);
        }

        commande.setTotal(totalCommande);
        commande.setCommandeProduits(itemsCommande);

        Commande commandeSauvegardee = commandeRepository.save(commande);

        // 4. Vider le panier & envoi reçu email
        panierService.viderPanier(user);
        emailService.envoyerRecuCommande(commandeSauvegardee);

        return commandeMapper.toResponse(commandeSauvegardee);
    }

    @Transactional(readOnly = true)
    public List<CommandeResponse> getMesCommandesByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'email : " + email));

        List<Commande> commandes = commandeRepository.findByUserOrderByDateCreationDesc(user);
        return commandes.stream().map(commandeMapper::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public CommandeResponse passerCommandeByEmail(String email, CreerCommandeRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'email : " + email));
        return passerCommande(user, request);
    }

    @Transactional(readOnly = true)
    public CommandeResponse getCommandeByIdAndEmail(String email, Long commandeId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'email : " + email));
        return getCommandeById(user, commandeId);
    }

    @Transactional(readOnly = true)
    public List<CommandeResponse> getMesCommandes(User user) {
        List<Commande> commandes = commandeRepository.findByUserOrderByDateCreationDesc(user);
        return commandes.stream().map(commandeMapper::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CommandeResponse getCommandeById(User user, Long commandeId) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Commande non trouvée avec l'id : " + commandeId));

        if (!commande.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Vous n'avez pas l'autorisation d'accéder à cette commande.");
        }

        return commandeMapper.toResponse(commande);
    }

    @Transactional(readOnly = true)
    public List<CommandeResponse> getAllCommandes() {
        return commandeRepository.findAllByOrderByDateCreationDesc().stream()
                .map(commandeMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommandeResponse changerStatus(Long commandeId, ChangerStatusCommandeRequest request) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Commande non trouvée avec l'id : " + commandeId));

        try {
            Commande.Status nouveauStatus = Commande.Status.valueOf(request.getStatus().toLowerCase());
            commande.setStatus(nouveauStatus);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Statut invalide : " + request.getStatus());
        }
        Commande commandeSauvegardee = commandeRepository.save(commande);

        if (commandeSauvegardee.getStatus() == Commande.Status.prete) {
            emailService.envoyerMailChangementStatut(commandeSauvegardee);
        }

        return commandeMapper.toResponse(commandeSauvegardee);
    }
}