package com.fast_food.mapper;

import com.fast_food.dto.PanierItemResponse;
import com.fast_food.dto.PanierResponse;
import com.fast_food.entite.Panier;
import com.fast_food.entite.PanierItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class PanierMapper {

    /**
     * Convertit un PanierItem en PanierItemResponse
     */
    public PanierItemResponse toItemResponse(PanierItem item) {
        if (item == null) {
            return null;
        }

        PanierItemResponse response = new PanierItemResponse();
        response.setId(item.getId());

        if (item.getProduitMenu() != null) {
            response.setProduitId(item.getProduitMenu().getId());
            response.setNomProduit(item.getProduitMenu().getNom());
            response.setPrixUnitaire(item.getProduitMenu().getPrix());

            // Calcul du sous-total : prixUnitaire * quantite
            if (item.getProduitMenu().getPrix() != null) {
                BigDecimal sousTotal = item.getProduitMenu().getPrix()
                        .multiply(BigDecimal.valueOf(item.getQuantite()));
                response.setSousTotal(sousTotal);
            }
        }

        response.setQuantite(item.getQuantite());
        return response;
    }

    /**
     * Convertit une entité Panier complète en PanierResponse
     */
    public PanierResponse toResponse(Panier panier) {
        if (panier == null) {
            return null;
        }

        PanierResponse response = new PanierResponse();
        response.setId(panier.getId());

        // Transformation de la liste des items
        List<PanierItemResponse> itemsResponse = (panier.getPanierContenu() == null) 
                ? Collections.emptyList()
                : panier.getPanierContenu().stream()
                        .map(this::toItemResponse)
                        .collect(Collectors.toList());

        response.setItems(itemsResponse);

        // Calcul du prix total du panier
        BigDecimal prixTotal = itemsResponse.stream()
                .map(PanierItemResponse::getSousTotal)
                .filter(sousTotal -> sousTotal != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        response.setPrixTotal(prixTotal);

        return response;
    }
}