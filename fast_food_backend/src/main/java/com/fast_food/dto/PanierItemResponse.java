package com.fast_food.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class PanierItemResponse {
    private Long id;
    private Long produitId;
    private String nomProduit;
    private BigDecimal prixUnitaire;
    private int quantite;
    private BigDecimal sousTotal;
}
