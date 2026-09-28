package com.fast_food.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class RecetteItemRequest {
    @NotNull
    private Long idMatiere;

    @NotNull
    @Positive
    private BigDecimal quantiteRequise;

    private String uniteMesure;
}