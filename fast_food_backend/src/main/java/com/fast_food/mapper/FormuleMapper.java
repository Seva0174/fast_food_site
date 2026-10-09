package com.fast_food.mapper;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.fast_food.dto.FormuleGroupeProduitResponse;
import com.fast_food.dto.FormuleGroupeResponse;
import com.fast_food.entite.FormuleGroupe;
import com.fast_food.entite.FormuleGroupeProduit;
import com.fast_food.entite.ProduitMenu;

@Component
public class FormuleMapper {

    public List<FormuleGroupeResponse> toGroupesResponse(List<FormuleGroupe> groupes) {
        if (groupes == null) {
            return new ArrayList<>();
        }
        return groupes.stream()
                .sorted(Comparator.comparingInt(FormuleGroupe::getOrdre).thenComparing(FormuleGroupe::getId))
                .map(this::toGroupeResponse)
                .collect(Collectors.toList());
    }

    public FormuleGroupeResponse toGroupeResponse(FormuleGroupe groupe) {
        FormuleGroupeResponse response = new FormuleGroupeResponse();
        response.setId(groupe.getId());
        response.setNom(groupe.getNom());
        response.setMinSelection(groupe.getMinSelection());
        response.setMaxSelection(groupe.getMaxSelection());
        response.setOrdre(groupe.getOrdre());

        List<FormuleGroupeProduitResponse> produits = new ArrayList<>();
        if (groupe.getProduits() != null) {
            for (FormuleGroupeProduit lien : groupe.getProduits()) {
                produits.add(toProduitResponse(lien));
            }
        }
        response.setProduits(produits);
        return response;
    }

    public FormuleGroupeProduitResponse toProduitResponse(FormuleGroupeProduit lien) {
        FormuleGroupeProduitResponse response = new FormuleGroupeProduitResponse();
        response.setId(lien.getId());
        response.setSurcout(lien.getSurcout());

        ProduitMenu produit = lien.getProduit();
        if (produit != null) {
            response.setIdProduit(produit.getId());
            response.setNomProduit(produit.getNom());
            response.setPrixProduit(produit.getPrix());
            response.setImageUrl(produit.getImageUrl());
            response.setEstDispo(produit.isEstDispo());
        }
        return response;
    }

    /**
     * Une formule est realisable si elle possede au moins un emplacement et si chaque
     * emplacement obligatoire propose encore au moins un produit disponible.
     * Un produit classique est toujours considere comme realisable.
     */
    public boolean estRealisable(ProduitMenu produit) {
        if (!produit.isEstFormule()) {
            return true;
        }
        if (produit.getGroupesFormule() == null || produit.getGroupesFormule().isEmpty()) {
            return false;
        }
        for (FormuleGroupe groupe : produit.getGroupesFormule()) {
            if (groupe.getMinSelection() > 0) {
                boolean auMoinsUnDisponible = groupe.getProduits().stream()
                        .anyMatch(lien -> lien.getProduit() != null && lien.getProduit().isEstDispo());
                if (!auMoinsUnDisponible) {
                    return false;
                }
            }
        }
        return true;
    }
}