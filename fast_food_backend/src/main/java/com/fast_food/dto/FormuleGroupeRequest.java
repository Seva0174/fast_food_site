package com.fast_food.dto;

import lombok.Data;

@Data
public class FormuleGroupeRequest {
    private String nom;
    private Integer minSelection;
    private Integer maxSelection;
    // Position d'affichage (si absent, ajoute a la fin)
    private Integer ordre;
}