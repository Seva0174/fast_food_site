package com.fast_food.service;

import com.fast_food.dto.ChangerStatusCommandeRequest;
import com.fast_food.dto.CreerCommandeRequest;
import com.fast_food.dto.CommandeResponse;
import com.fast_food.entite.Commande;
import com.fast_food.entite.CommandeItemOption;
import com.fast_food.entite.CommandeMenu;
import com.fast_food.entite.FormuleGroupe;
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

        // 2. Contrôle des formules et déstockage atomique (recette de base + options)
        for (PanierItem item : panier.getPanierContenu()) {
            ProduitMenu produit = item.getProduitMenu();

            if (!produit.isEstDispo()) {
                throw new IllegalArgumentException("Le produit '" + produit.getNom() + "' n'est plus disponible au menu.");
            }

            deduireStock(produit, item.getQuantite(), item.getOptions());

            // Une formule n'a pas de recette propre : le stock est déduit à partir de ses composants
            if (produit.isEstFormule()) {
                panierService.validerCompositionFormule(produit, item.getComposants());

                for (PanierItem composant : item.getComposants()) {
                    deduireStock(composant.getProduitMenu(), item.getQuantite(), composant.getOptions());
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

        // Liste à plat : chaque ligne principale est suivie de ses lignes enfants (composants de formule)
        List<CommandeMenu> lignes = new ArrayList<>();

        for (PanierItem item : panier.getPanierContenu()) {
            ProduitMenu produit = item.getProduitMenu();

            CommandeMenu ligne = creerLigneCommande(commande, produit, item.getQuantite(),
                    produit.getPrix(), item.getOptions(), null, null);
            lignes.add(ligne);

            if (produit.isEstFormule()) {
                for (PanierItem composant : item.getComposants()) {
                    FormuleGroupe groupe = composant.getFormuleGroupe();
                    BigDecimal surcoutEmplacement = groupe.surcoutPour(composant.getProduitMenu());

                    CommandeMenu ligneEnfant = creerLigneCommande(commande, composant.getProduitMenu(),
                            item.getQuantite(), surcoutEmplacement, composant.getOptions(), ligne, groupe);
                    ligne.getComposants().add(ligneEnfant);
                    lignes.add(ligneEnfant);
                }
            }
        }

        // Le prix des lignes enfants ne contient que leurs suppléments : la somme ne compte donc rien en double
        BigDecimal totalCommande = BigDecimal.ZERO;
        for (CommandeMenu ligne : lignes) {
            totalCommande = totalCommande.add(ligne.getPrix().multiply(BigDecimal.valueOf(ligne.getQuantite())));
        }

        commande.setTotal(totalCommande);
        commande.setCommandeProduits(lignes);

        Commande commandeSauvegardee = commandeRepository.save(commande);

        // 4. Vider le panier & envoi reçu email
        panierService.viderPanier(user);
        emailService.envoyerRecuCommande(commandeSauvegardee);

        return commandeMapper.toResponse(commandeSauvegardee);
    }

    // Déduit du stock la recette du produit et les matières premières des options choisies
    private void deduireStock(ProduitMenu produit, int quantite, List<PanierItemOption> options) {
        BigDecimal facteur = BigDecimal.valueOf(quantite);

        // Ingrédients de la recette de base
        List<Recette> recettes = recetteRepository.findByProduitMenu(produit);
        for (Recette recette : recettes) {
            BigDecimal quantiteNecessaire = recette.getQuantiteRequise().multiply(facteur);

            int updated = stockRepository.decrementStock(recette.getMatierePremiere().getId(), quantiteNecessaire);
            if (updated == 0) {
                throw new IllegalArgumentException("Stock insuffisant pour " + recette.getMatierePremiere().getNom());
            }
        }

        // Matières premières liées aux options choisies
        if (options != null) {
            for (PanierItemOption pio : options) {
                OptionItem option = pio.getOptionItem();
                if (option.getMatierePremiere() != null && option.getQuantiteDeduite() != null) {
                    BigDecimal qteOptionTotale = option.getQuantiteDeduite().multiply(facteur);

                    int updatedOpt = stockRepository.decrementStock(option.getMatierePremiere().getId(), qteOptionTotale);
                    if (updatedOpt == 0) {
                        throw new IllegalArgumentException("Stock insuffisant pour l'option : " + option.getNom());
                    }
                }
            }
        }
    }

    // Construit une ligne de commande avec l'historisation de ses options
    // prixBase : prix du produit pour une ligne principale, surcout de l'emplacement pour une ligne enfant
    private CommandeMenu creerLigneCommande(Commande commande, ProduitMenu produit, int quantite,
                                            BigDecimal prixBase, List<PanierItemOption> optionsPanier,
                                            CommandeMenu parent, FormuleGroupe groupe) {
        CommandeMenu ligne = new CommandeMenu();
        ligne.setCommandeInfo(commande);
        ligne.setProduitMenu(produit);
        ligne.setQuantite(quantite);
        ligne.setParent(parent);
        ligne.setFormuleGroupe(groupe);

        BigDecimal prix = prixBase;
        List<CommandeItemOption> optionsCommande = new ArrayList<>();

        if (optionsPanier != null) {
            for (PanierItemOption pio : optionsPanier) {
                OptionItem opt = pio.getOptionItem();
                BigDecimal surcout = opt.getSurcout() != null ? opt.getSurcout() : BigDecimal.ZERO;
                prix = prix.add(surcout);

                CommandeItemOption cio = new CommandeItemOption();
                cio.setCommandeMenu(ligne);
                cio.setOptionItem(opt);
                cio.setNomOption(opt.getNom());
                cio.setSurcout(surcout);
                optionsCommande.add(cio);
            }
        }

        ligne.setPrix(prix);
        ligne.setOptions(optionsCommande);
        return ligne;
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