package com.fast_food.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CatalogueFournisseurResponse {
    private Long id;
    private Long idFournisseur;
    private String fournisseurNom;
    private Long idStock;
    private String matierePremiereNom;
    private BigDecimal prixUnitaire;
}