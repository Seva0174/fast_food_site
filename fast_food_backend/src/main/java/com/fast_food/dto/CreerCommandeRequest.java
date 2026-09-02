package com.fast_food.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreerCommandeRequest {
    @NotBlank
    private String cpRue;
    @NotBlank
    private String cpVille;
    @NotBlank
    private String cpCodePostal;
}