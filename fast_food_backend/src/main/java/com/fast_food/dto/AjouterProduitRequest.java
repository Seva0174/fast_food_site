package com.fast_food.dto;

import java.util.List;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class AjouterProduitRequest {
    private Long id;
    private Long produitId;
    @Min(value = 1, message = "La quantité doit être au moins de 1")
    private int quantite;
    private List<Long> optionIds;
    private List<ChoixFormuleRequest> choixFormule;

}
