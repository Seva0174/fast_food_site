package com.fast_food.dto;

import java.util.List;
import lombok.Data;

@Data
public class OptionGroupeResponse {
    private Long id;
    private String nom;
    private int minSelection;
    private int maxSelection;
    private List<OptionItemResponse> options;
}