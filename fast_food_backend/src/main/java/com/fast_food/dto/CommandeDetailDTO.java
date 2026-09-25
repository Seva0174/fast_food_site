package com.fast_food.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommandeDetailDTO {
    private String matierePremiereNom;
    private Integer quantite;
    private BigDecimal prixUnitaire;
    private BigDecimal sousTotal;

    public CommandeDetailDTO(String matierePremiereNom, Integer quantite, BigDecimal prixUnitaire) {
        this.matierePremiereNom = matierePremiereNom;
        this.quantite = quantite;
        this.prixUnitaire = prixUnitaire;
        this.sousTotal = (prixUnitaire != null && quantite != null) 
                ? prixUnitaire.multiply(BigDecimal.valueOf(quantite)) 
                : BigDecimal.ZERO;
    }
}