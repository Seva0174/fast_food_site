package com.fast_food.service;

import com.fast_food.dto.ChangerStatusCommandeRequest;
import com.fast_food.dto.CreerCommandeRequest;
import com.fast_food.dto.CommandeResponse;
import com.fast_food.entite.Commande;
import com.fast_food.entite.CommandeMenu;
import com.fast_food.entite.Panier;
import com.fast_food.entite.PanierItem;
import com.fast_food.entite.User;
import com.fast_food.exception.ResourceNotFoundException;
import com.fast_food.mapper.CommandeMapper;
import com.fast_food.repositorie.CommandeRepository;
import com.fast_food.repositorie.PanierRepository;
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

    //Valide le panier courant et crée une nouvelle commande.
    @Transactional
    public CommandeResponse passerCommande(User user, CreerCommandeRequest request) {
        // 1. Récupérer le panier de l'utilisateur
        Panier panier = panierRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Aucun panier trouvé pour cet utilisateur."));

        if (panier.getPanierContenu() == null || panier.getPanierContenu().isEmpty()) {
            throw new IllegalArgumentException("Votre panier est vide. Impossible de passer la commande.");
        }

        // 2. Initialiser l'entité Commande
        Commande commande = new Commande();
        commande.setUser(user);
        commande.setStatus(Commande.Status.en_attente);
        commande.setCpRue(request.getCpRue());
        commande.setCpVille(request.getCpVille());
        commande.setCpCodePostal(request.getCpCodePostal());
        commande.setDateCreation(LocalDateTime.now());

        // 3. Convertir les PanierItem en CommandeMenu & calculer le total
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
            commandeMenu.setPrix(prixUnitaire); // Fige le prix au moment de l'achat

            itemsCommande.add(commandeMenu);
        }

        commande.setTotal(totalCommande);
        commande.setCommandeProduits(itemsCommande);

        // 4. Sauvegarder la commande en BDD
        Commande commandeSauvegardee = commandeRepository.save(commande);

        // 5. Vider le panier après commande réussie
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
            throw new IllegalArgumentException("Vous n'avez pas l'autorisation d'accéder à cette commande.");
        }

        return commandeMapper.toResponse(commande);
    }

    //Récupérer toutes les commandes (Réservé Cuisinier / Admin)
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