package com.fast_food.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class AjouterProduitRequest {
    private Long id;
    private Long produitId;
    @Min(value = 1, message = "La quantité doit être au moins de 1")
    private int quantite;
}
