package com.fast_food.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OptionItemRequest {

    private Long groupeId;

    @NotBlank(message = "Le nom de l'option est obligatoire")
    private String nom;
    private BigDecimal surcout;
    private Long matierePremiereId;
    private BigDecimal quantiteDeduite;
}