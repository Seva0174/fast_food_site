package com.fast_food.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Data;

@Data
public class PanierResponse {
    private Long id;
    private List<PanierItemResponse> items;
    private BigDecimal prixTotal;
}
