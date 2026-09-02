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
public class EmployeSalaireResponse {
    private Long employeId;
    private String employeNom;
    private String role;
    private BigDecimal totalHeures;
    private BigDecimal salaireHeure;
    private BigDecimal salaireTotalEstime;
}