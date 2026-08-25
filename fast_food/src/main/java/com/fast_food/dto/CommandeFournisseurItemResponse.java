package com.fast_food.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CommandeFournisseurItemResponse {
    private Long id;
    private Long idStock;
    private String matierePremiereNom;
    private BigDecimal quantite;
    private BigDecimal prixUnitaire;
    private BigDecimal totalLigne;
}