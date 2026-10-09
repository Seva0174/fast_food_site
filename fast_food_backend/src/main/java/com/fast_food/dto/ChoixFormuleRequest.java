package com.fast_food.dto;

import java.util.List;

import lombok.Data;

/**
 * Un produit choisi dans un emplacement de formule.
 * Si un emplacement autorise plusieurs choix, on envoie une entree par produit choisi.
 */
@Data
public class ChoixFormuleRequest {
    private Long idGroupe;
    private Long idProduit;
    // Options du produit choisi (viande, sauces, supplements...)
    private List<Long> optionIds;
}