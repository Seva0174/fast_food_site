package com.fast_food.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CatalogueFournisseurRequest {
    @NotNull
    private Long idFournisseur;
    
    @NotNull
    private Long idStock;
    
    @NotNull
    @Positive
    private BigDecimal prixUnitaire;
}