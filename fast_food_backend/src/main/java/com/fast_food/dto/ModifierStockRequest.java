package com.fast_food.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ModifierStockRequest {
    @NotNull
    private BigDecimal quantite;
    private String uniteMesure;
}