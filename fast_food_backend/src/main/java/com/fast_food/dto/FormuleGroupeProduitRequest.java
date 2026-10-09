package com.fast_food.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class FormuleGroupeProduitRequest {
    // Obligatoire a l'ajout, ignore a la modification
    private Long idProduit;
    private BigDecimal surcout;
}