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

    public PanierItemResponse toItemResponse(PanierItem item) {
        PanierItemResponse response = new PanierItemResponse();
        response.setId(item.getId());
        response.setProduitId(item.getProduitMenu().getId());
        response.setNomProduit(item.getProduitMenu().getNom());
        response.setQuantite(item.getQuantite());

        // Calcul des options et du surcoût
        BigDecimal surcoutTotal = BigDecimal.ZERO;
        List<PanierItemOptionResponse> optionResponses = new ArrayList<>();

        if (item.getOptions() != null) {
            for (PanierItemOption pio : item.getOptions()) {
                PanierItemOptionResponse optDto = new PanierItemOptionResponse();
                optDto.setId(pio.getOptionItem().getId());
                optDto.setNom(pio.getOptionItem().getNom());
                optDto.setSurcout(pio.getOptionItem().getSurcout());
                optionResponses.add(optDto);

                if (pio.getOptionItem().getSurcout() != null) {
                    surcoutTotal = surcoutTotal.add(pio.getOptionItem().getSurcout());
                }
            }
        }

        response.setOptions(optionResponses);

        // Prix unitaire réel = Prix produit + surcoûts
        BigDecimal prixUnitaireCalcule = item.getProduitMenu().getPrix().add(surcoutTotal);
        response.setPrixUnitaire(prixUnitaireCalcule);

        // Sous-total = Prix unitaire réel * Quantité
        response.setSousTotal(prixUnitaireCalcule.multiply(BigDecimal.valueOf(item.getQuantite())));

        return response;
    }
}