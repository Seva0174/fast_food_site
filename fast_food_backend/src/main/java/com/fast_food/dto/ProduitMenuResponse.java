package com.fast_food.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class ProduitMenuResponse {
    private Long id;
    private String nom; 
    private String description;
    private BigDecimal prix;
    private String imageUrl;
    private Boolean estDispo;
    private CategorieResponse categorie;
}
