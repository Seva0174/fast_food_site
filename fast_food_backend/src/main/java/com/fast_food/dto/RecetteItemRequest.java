package com.fast_food.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class RecetteItemRequest {
    @NotNull(message = "La matière première est obligatoire")
    private Long idMatiere;

    @NotNull(message = "La quantité requise est obligatoire")
    @Positive(message = "La quantité requise doit être supérieure à 0")
    private BigDecimal quantiteRequise;
}