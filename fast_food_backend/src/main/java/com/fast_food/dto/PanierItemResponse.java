package com.fast_food.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class PanierItemResponse {
    private Long id;
    private Long produitId;
    private String nomProduit;
    private BigDecimal prixUnitaire;
    private int quantite;
    private BigDecimal sousTotal;
    private List<PanierItemOptionResponse> options;
    private List<PanierItemResponse> composants = new ArrayList<>();
    private Long idGroupe;
    private String nomGroupe;
    private BigDecimal surcoutEmplacement;
}
