package com.fast_food.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class OptionItemRequest {

    private Long groupeId;

    @NotBlank(message = "Le nom de l'option est obligatoire")
    private String nom;

    @PositiveOrZero(message = "Le surcoût ne peut pas être négatif")
    private BigDecimal surcout;

    private Long matierePremiereId;

    @Positive(message = "La quantité déduite doit être supérieure à 0")
    private BigDecimal quantiteDeduite;
}