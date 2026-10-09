package com.fast_food.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class FormuleGroupeResponse {
    private Long id;
    private String nom;
    private int minSelection;
    private int maxSelection;
    private int ordre;
    private List<FormuleGroupeProduitResponse> produits = new ArrayList<>();
}