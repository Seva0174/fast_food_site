package com.fast_food.service;

import com.fast_food.dto.AjouterProduitRequest;
import com.fast_food.dto.ModifierQuantiteRequest;
import com.fast_food.dto.PanierResponse;
import com.fast_food.entite.Panier;
import com.fast_food.entite.PanierItem;
import com.fast_food.entite.ProduitMenu;
import com.fast_food.entite.User;
import com.fast_food.exception.ResourceNotFoundException;
import com.fast_food.mapper.PanierMapper;
import com.fast_food.repositorie.PanierRepository;
import com.fast_food.repositorie.ProduitMenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PanierService {

    private final PanierRepository panierRepository;
    private final ProduitMenuRepository produitMenuRepository;
    private final PanierMapper panierMapper;

    /**
     * Récupère le panier de l'utilisateur ou en crée un s'il n'en a pas encore.
     */
    @Transactional
    public Panier getPanierEntityByUser(User user) {
        return panierRepository.findByUser(user)
                .orElseGet(() -> {
                    Panier nouveauPanier = new Panier();
                    nouveauPanier.setUser(user);
                    nouveauPanier.setPanierContenu(new ArrayList<>());
                    return panierRepository.save(nouveauPanier);
                });
    }

    /**
     * Retourne le panier sous forme de PanierResponse pour le client
     */
    @Transactional(readOnly = true)
    public PanierResponse getPanierByUser(User user) {
        Panier panier = panierRepository.findByUser(user)
                .orElseGet(() -> {
                    Panier p = new Panier();
                    p.setUser(user);
                    p.setPanierContenu(new ArrayList<>());
                    return p;
                });
        return panierMapper.toResponse(panier);
    }

    /**
     * Ajoute un produit au panier ou augmente la quantité si le produit est déjà présent.
     */
    @Transactional
    public PanierResponse ajouterProduit(User user, AjouterProduitRequest request) {
        // 1. Récupérer le produit et vérifier s'il existe
        ProduitMenu produit = produitMenuRepository.findById(request.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Produit non trouvé avec l'id : " + request.getId()));

        // 2. Vérifier la disponibilité du produit
        if (Boolean.FALSE.equals(produit.isEstDispo())) {
            throw new IllegalArgumentException("Ce produit n'est pas disponible actuellement.");
        }

        // 3. Récupérer ou créer le panier
        Panier panier = getPanierEntityByUser(user);

        // 4. Chercher si le produit existe déjà dans le panier
        Optional<PanierItem> itemExistant = panier.getPanierContenu().stream()
                .filter(item -> item.getProduitMenu().getId().equals(produit.getId()))
                .findFirst();

        if (itemExistant.isPresent()) {
            // Augmenter la quantité
            PanierItem item = itemExistant.get();
            item.setQuantite(item.getQuantite() + request.getQuantite());
        } else {
            // Créer une nouvelle ligne dans le panier
            PanierItem nouveauItem = new PanierItem();
            nouveauItem.setPanier(panier);
            nouveauItem.setProduitMenu(produit);
            nouveauItem.setQuantite(request.getQuantite());
            panier.getPanierContenu().add(nouveauItem);
        }

        // 5. Sauvegarder et retourner le DTO de réponse
        Panier panierSauvegarde = panierRepository.save(panier);
        return panierMapper.toResponse(panierSauvegarde);
    }

    /**
     * Modifie la quantité d'un item spécifique dans le panier.
     */
    @Transactional
    public PanierResponse modifierQuantite(User user, Long itemId, ModifierQuantiteRequest request) {
        Panier panier = getPanierEntityByUser(user);

        PanierItem item = panier.getPanierContenu().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Item du panier non trouvé avec l'id : " + itemId));

        if (request.getQuantite() <= 0) {
            // Si la quantité est <= 0, on supprime l'élément du panier
            panier.getPanierContenu().remove(item);
        } else {
            item.setQuantite(request.getQuantite());
        }

        Panier panierSauvegarde = panierRepository.save(panier);
        return panierMapper.toResponse(panierSauvegarde);
    }

    /**
     * Supprime un item spécifique du panier.
     */
    @Transactional
    public PanierResponse supprimerItem(User user, Long itemId) {
        Panier panier = getPanierEntityByUser(user);

        boolean supprime = panier.getPanierContenu().removeIf(item -> item.getId().equals(itemId));
        if (!supprime) {
            throw new ResourceNotFoundException("Item du panier non trouvé avec l’id : " + itemId);
        }

        Panier panierSauvegarde = panierRepository.save(panier);
        return panierMapper.toResponse(panierSauvegarde);
    }

    /**
     * Vider totalement le panier de l'utilisateur.
     */
    @Transactional
    public void viderPanier(User user) {
        Panier panier = getPanierEntityByUser(user);
        panier.getPanierContenu().clear();
        panierRepository.save(panier);
    }
}