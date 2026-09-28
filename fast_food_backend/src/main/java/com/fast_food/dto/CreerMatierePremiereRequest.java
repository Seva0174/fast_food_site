package com.fast_food.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreerMatierePremiereRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotNull(message = "La quantité initiale est obligatoire")
    @PositiveOrZero(message = "La quantité ne peut pas être négative")
    private BigDecimal quantite;

    private String uniteMesure = "unite";
}