package com.fast_food.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeHeureRequest {
    @NotNull(message = "L'ID employé est obligatoire")
    private Long employeId;

    @NotNull(message = "Le nombre d'heures est obligatoire")
    @DecimalMin(value = "0.1", message = "Le nombre d'heures doit être supérieur à 0")
    @DecimalMax(value = "24.0", message = "Impossible d'enregistrer plus de 24 heures par jour")
    private BigDecimal nbHeure;

    @NotNull(message = "La date est obligatoire")
    private LocalDate date;
}