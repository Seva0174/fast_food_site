package com.fast_food.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class PanierItemOptionResponse {
    private Long id;
    private String nom;
    private BigDecimal surcout;
}