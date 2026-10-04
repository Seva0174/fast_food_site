package com.fast_food.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class CommandeItemOptionResponse {
    private String nomOption;
    private BigDecimal surcoutHistorise;
}