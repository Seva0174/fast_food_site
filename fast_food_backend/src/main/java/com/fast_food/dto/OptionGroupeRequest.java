package com.fast_food.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OptionGroupeRequest {

    @NotBlank(message = "Le nom du groupe d'options est obligatoire")
    private String nom;

    @Min(value = 0, message = "La sélection minimale ne peut pas être négative")
    private Integer minSelection = 0;

    @Min(value = 1, message = "La sélection maximale doit être d'au moins 1")
    private Integer maxSelection = 1;
}