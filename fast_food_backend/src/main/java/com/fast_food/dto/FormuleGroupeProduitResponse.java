package com.fast_food.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class FormuleGroupeProduitResponse {
    // Identifiant du lien emplacement/produit (utilise cote admin)
    private Long id;
    private Long idProduit;
    private String nomProduit;
    private BigDecimal prixProduit;
    private String imageUrl;
    private boolean estDispo;
    private BigDecimal surcout;
}