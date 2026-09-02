package com.fast_food.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChangerStatutCommandeFournisseurRequest {
    @NotBlank
    private String status; // "en_attente", "expedie", "recue", "annulee"
}