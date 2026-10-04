package com.fast_food.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class OptionItemResponse {
    private Long id;
    private String nom;
    private BigDecimal surcout;
    private Long idMatiere;
}