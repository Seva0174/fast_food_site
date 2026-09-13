package com.fast_food.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CreerCommandeRequest {
    @NotBlank(message = "La rue est obligatoire")
    private String cpRue;

    @NotBlank(message = "La ville est obligatoire")
    private String cpVille;

    @NotBlank(message = "Le code postal est obligatoire")
    @Pattern(regexp = "^[0-9]{5}$", message = "Le code postal doit contenir exactement 5 chiffres")
    private String cpCodePostal;
}