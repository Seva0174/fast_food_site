package com.fast_food.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class RecetteItemResponse {
    private Long idMatiere;
    private String nomMatiere;
    private BigDecimal quantiteRequise;
}