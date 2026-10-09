package com.fast_food.mapper;

import com.fast_food.dto.PanierItemOptionResponse;
import com.fast_food.dto.PanierItemResponse;
import com.fast_food.dto.PanierResponse;
import com.fast_food.entite.Panier;
import com.fast_food.entite.PanierItem;
import com.fast_food.entite.PanierItemOption;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class PanierMapper {

    public PanierResponse toResponse(Panier panier) {
        PanierResponse response = new PanierResponse();
        response.setId(panier.getId());

        // Le panier ne contient que les lignes principales : les composants d'une formule
        // sont rattaches a leur ligne parent et deja inclus dans son prix.
        if (panier.getPanierContenu() != null) {
            List<PanierItemResponse> itemResponses = panier.getPanierContenu().stream()
                    .map(this::toItemResponse)
                    .collect(Collectors.toList());
            response.setItems(itemResponses);

            BigDecimal total = itemResponses.stream()
                    .map(PanierItemResponse::getSousTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            response.setPrixTotal(total);
        } else {
            response.setItems(new ArrayList<>());
            response.setPrixTotal(BigDecimal.ZERO);
        }

        return response;
    }

    /**
     * Ligne principale du panier.
     * Pour une formule, le prix unitaire est le prix de base + les supplements de tous les composants.
     */
    public PanierItemResponse toItemResponse(PanierItem item) {
        PanierItemResponse response = new PanierItemResponse();
        response.setId(item.getId());
        response.setProduitId(item.getProduitMenu().getId());
        response.setNomProduit(item.getProduitMenu().getNom());
        response.setQuantite(item.getQuantite());

        List<PanierItemOptionResponse> optionResponses = new ArrayList<>();
        BigDecimal surcoutOptions = remplirOptions(item, optionResponses);
        response.setOptions(optionResponses);

        BigDecimal prixUnitaire = item.getProduitMenu().getPrix().add(surcoutOptions);

        List<PanierItemResponse> composants = new ArrayList<>();
        if (item.getComposants() != null) {
            for (PanierItem enfant : item.getComposants()) {
                PanierItemResponse enfantResponse = toComposantResponse(enfant);
                composants.add(enfantResponse);
                prixUnitaire = prixUnitaire.add(enfantResponse.getPrixUnitaire());
            }
        }
        response.setComposants(composants);

        response.setPrixUnitaire(prixUnitaire);
        response.setSousTotal(prixUnitaire.multiply(BigDecimal.valueOf(item.getQuantite())));

        return response;
    }

    /**
     * Composant d'une formule : son prix unitaire est uniquement le supplement
     * (surcout de l'emplacement + surcouts des options choisies).
     */
    private PanierItemResponse toComposantResponse(PanierItem enfant) {
        PanierItemResponse response = new PanierItemResponse();
        response.setId(enfant.getId());
        response.setProduitId(enfant.getProduitMenu().getId());
        response.setNomProduit(enfant.getProduitMenu().getNom());
        response.setQuantite(enfant.getQuantite());

        if (enfant.getFormuleGroupe() != null) {
            response.setIdGroupe(enfant.getFormuleGroupe().getId());
            response.setNomGroupe(enfant.getFormuleGroupe().getNom());
        }

        List<PanierItemOptionResponse> optionResponses = new ArrayList<>();
        BigDecimal surcoutOptions = remplirOptions(enfant, optionResponses);
        response.setOptions(optionResponses);

        BigDecimal surcoutEmplacement = enfant.getFormuleGroupe() != null
                ? enfant.getFormuleGroupe().surcoutPour(enfant.getProduitMenu())
                : BigDecimal.ZERO;
        response.setSurcoutEmplacement(surcoutEmplacement);

        BigDecimal supplement = surcoutEmplacement.add(surcoutOptions);
        response.setPrixUnitaire(supplement);
        response.setSousTotal(supplement.multiply(BigDecimal.valueOf(enfant.getQuantite())));
        response.setComposants(new ArrayList<>());

        return response;
    }

    // Remplit la liste des options et retourne le total des surcouts
    private BigDecimal remplirOptions(PanierItem item, List<PanierItemOptionResponse> sortie) {
        BigDecimal surcoutTotal = BigDecimal.ZERO;

        if (item.getOptions() != null) {
            for (PanierItemOption pio : item.getOptions()) {
                PanierItemOptionResponse optDto = new PanierItemOptionResponse();
                optDto.setId(pio.getOptionItem().getId());
                optDto.setNom(pio.getOptionItem().getNom());
                optDto.setSurcout(pio.getOptionItem().getSurcout());
                sortie.add(optDto);

                if (pio.getOptionItem().getSurcout() != null) {
                    surcoutTotal = surcoutTotal.add(pio.getOptionItem().getSurcout());
                }
            }
        }
        return surcoutTotal;
    }
}