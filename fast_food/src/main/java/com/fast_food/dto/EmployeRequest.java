package com.fast_food.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeRequest {
    private String nom;
    private String role; // CUISINIER, MANAGER, CAISIER
    private BigDecimal salaireHeure;
}