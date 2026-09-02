package com.fast_food.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CommandeFournisseurResponse {
    private Long id;
    private Long idFournisseur;
    private String fournisseurNom;
    private LocalDate dateCommande;
    private LocalDate dateReception;
    private String status;
    private BigDecimal montantTotal;
    private List<CommandeFournisseurItemResponse> details;
}