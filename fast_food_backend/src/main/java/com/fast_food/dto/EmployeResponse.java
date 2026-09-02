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
public class EmployeResponse {
    private Long id;
    private String nom;
    private String role;
    private BigDecimal salaireHeure;
}