package com.fast_food.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class CommandeItemResponse {
    private Long id;
    private Long produitId;
    private String nomProduit;
    private Integer quantite;
    private BigDecimal prix;
    private BigDecimal sousTotal;
    private List<CommandeItemOptionResponse> options;
    private List<CommandeItemResponse> composants = new ArrayList<>();
    private String nomGroupe;
}