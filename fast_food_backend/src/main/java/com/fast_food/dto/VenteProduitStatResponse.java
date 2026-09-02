package com.fast_food.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VenteProduitStatResponse {
    private Long produitId;
    private String produitNom;
    private Long quantiteVendue;
    private BigDecimal totalGenere;
}