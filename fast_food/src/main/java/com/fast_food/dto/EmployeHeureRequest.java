package com.fast_food.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeHeureRequest {
    private Long employeId;
    private BigDecimal nbHeure;
    private LocalDate date;
}