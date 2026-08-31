package com.fast_food.service;

import com.fast_food.dto.ChangerStatusCommandeRequest;
import com.fast_food.dto.CreerCommandeRequest;
import com.fast_food.dto.CommandeResponse;
import com.fast_food.entite.Commande;
import com.fast_food.entite.CommandeMenu;
import com.fast_food.entite.Panier;
import com.fast_food.entite.PanierItem;
import com.fast_food.entite.ProduitMenu;
import com.fast_food.entite.Recette;
import com.fast_food.entite.StockMatierePremiere;
import com.fast_food.entite.User;
import com.fast_food.exception.ResourceNotFoundException;
import com.fast_food.mapper.CommandeMapper;
import com.fast_food.repositorie.CommandeRepository;
import com.fast_food.repositorie.PanierRepository;
import com.fast_food.repositorie.RecetteRepository;
import com.fast_food.repositorie.StockMatierePremiereRepository;
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
    private final PanierService panierService;
    private final CommandeMapper commandeMapper;

    // Nouveaux repositories pour la gestion des stocks
    private final RecetteRepository recetteRepository;
    private final StockMatierePremiereRepository stockRepository;

    @Transactional
    public CommandeResponse passerCommande(User user, CreerCommandeRequest request) {
        // 1. Récupérer le panier
        Panier panier = panierRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Aucun panier trouvé pour cet utilisateur."));
        if (panier.getPanierContenu() == null || panier.getPanierContenu().isEmpty()) {
            throw new IllegalArgumentException("Votre panier est vide. Impossible de passer la commande.");
        }

        // 2. Verification des stocks
        for (PanierItem item : panier.getPanierContenu()) {
            ProduitMenu produit = item.getProduitMenu();

            // Vérifier la disponibilité manuelle du produit
            if (Boolean.FALSE.equals(produit.isEstDispo())) {
                throw new IllegalArgumentException("Le produit '" + produit.getNom() + "' n'est plus disponible au menu.");
            }

            // Vérifier si le stock de matières premières est suffisant pour couvrir la quantité demandée
            List<Recette> recettes = recetteRepository.findByProduitMenu(produit);
            for (Recette recette : recettes) {
                StockMatierePremiere stock = recette.getMatierePremiere();
                BigDecimal quantiteNecessaire = recette.getQuantiteRequise()
                        .multiply(BigDecimal.valueOf(item.getQuantite()));

                if (stock.getQuantite().compareTo(quantiteNecessaire) < 0) {
                    throw new IllegalArgumentException(
                        "Stock insuffisant pour préparer le produit '" + produit.getNom() + "'"
                    );
                }
            }
        }

        // 3. Deduction des stocks
        for (PanierItem item : panier.getPanierContenu()) {
            List<Recette> recettes = recetteRepository.findByProduitMenu(item.getProduitMenu());
            for (Recette recette : recettes) {
                StockMatierePremiere stock = recette.getMatierePremiere();
                BigDecimal quantiteNecessaire = recette.getQuantiteRequise()
                        .multiply(BigDecimal.valueOf(item.getQuantite()));

                // Soustraction du stock disponible
                int updated = stockRepository.decrementStock(
                        stock.getId(),
                        quantiteNecessaire
                );

                if (updated == 0) {
                    throw new IllegalArgumentException(
                        "Stock insuffisant pour le produit '" + item.getProduitMenu().getNom() + "'"
                    );
                }
            }
        }

        // 4. Initialiser et sauvegarder la Commande
        Commande commande = new Commande();
        commande.setUser(user);
        commande.setStatus(Commande.Status.en_attente);
        commande.setCpRue(request.getCpRue());
        commande.setCpVille(request.getCpVille());
        commande.setCpCodePostal(request.getCpCodePostal());
        commande.setDateCreation(LocalDateTime.now());

        BigDecimal totalCommande = BigDecimal.ZERO;
        List<CommandeMenu> itemsCommande = new ArrayList<>();

        for (PanierItem item : panier.getPanierContenu()) {
            BigDecimal prixUnitaire = item.getProduitMenu().getPrix();
            BigDecimal sousTotal = prixUnitaire.multiply(BigDecimal.valueOf(item.getQuantite()));
            totalCommande = totalCommande.add(sousTotal);

            CommandeMenu commandeMenu = new CommandeMenu();
            commandeMenu.setCommandeInfo(commande);
            commandeMenu.setProduitMenu(item.getProduitMenu());
            commandeMenu.setQuantite(item.getQuantite());
            commandeMenu.setPrix(prixUnitaire);

            itemsCommande.add(commandeMenu);
        }

        commande.setTotal(totalCommande);
        commande.setCommandeProduits(itemsCommande);

        Commande commandeSauvegardee = commandeRepository.save(commande);

        // 5. Vider le panier
        panierService.viderPanier(user);

        return commandeMapper.toResponse(commandeSauvegardee);
    }

    
    //Récupérer l'historique des commandes d'un utilisateur
    @Transactional(readOnly = true)
    public List<CommandeResponse> getMesCommandes(User user) {
        List<Commande> commandes = commandeRepository.findByUserOrderByDateCreationDesc(user);
        return commandes.stream()
                .map(commandeMapper::toResponse)
                .collect(Collectors.toList());
    }

    //Récupérer une commande par son ID (pour le suivi du client)
    @Transactional(readOnly = true)
    public CommandeResponse getCommandeById(User user, Long commandeId) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Commande non trouvée avec l'id : " + commandeId));

        if (!commande.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Vous n'avez pas l'autorisation d'accéder à cette commande.");
        }

        return commandeMapper.toResponse(commande);
    }

    //Récupérer toutes les commandes (Cuisinier / Admin)
    @Transactional(readOnly = true)
    public List<CommandeResponse> getAllCommandes() {
        return commandeRepository.findAllByOrderByDateCreationDesc().stream()
                .map(commandeMapper::toResponse)
                .collect(Collectors.toList());
    }

    // Mettre à jour le statut d'une commande (Réservé Admin / Employé)
    @Transactional
    public CommandeResponse changerStatus(Long commandeId, ChangerStatusCommandeRequest request) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Commande non trouvée avec l'id : " + commandeId));

        try {
            Commande.Status nouveauStatus = Commande.Status.valueOf(request.getStatus());
            commande.setStatus(nouveauStatus);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Statut invalide : " + request.getStatus());
        }

        Commande commandeSauvegardee = commandeRepository.save(commande);
        return commandeMapper.toResponse(commandeSauvegardee);
    }
}