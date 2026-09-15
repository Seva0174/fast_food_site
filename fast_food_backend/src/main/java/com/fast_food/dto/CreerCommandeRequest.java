package com.fast_food.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreerCommandeRequest {

    @NotNull(message = "Le type de retrait est obligatoire (livraison ou click_and_collect)")
    private String typeRetrait;

    private String cpRue;
    private String cpVille;
    private String cpCodePostal;
}