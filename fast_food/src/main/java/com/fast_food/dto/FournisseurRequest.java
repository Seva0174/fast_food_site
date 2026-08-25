package com.fast_food.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FournisseurRequest {
    @NotBlank
    private String nom;
}