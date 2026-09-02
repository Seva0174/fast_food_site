package com.fast_food.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class CommandeItemResponse {
    private Long id;
    private Long produitId;
    private String nomProduit;
    private int quantite;
    private BigDecimal prix; // Prix unitaire figé au moment de la commande
    private BigDecimal sousTotal;
}