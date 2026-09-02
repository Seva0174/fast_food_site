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
public class StatistiquesGlobalesResponse {
    private BigDecimal chiffreAffairesTotal;
    private BigDecimal depensesApprovisionnement;
    private BigDecimal masseSalariale;
    private BigDecimal beneficeEstime; // CA - (Approvisionnement + Salaires)
    private Long nombreCommandesTotal;
}