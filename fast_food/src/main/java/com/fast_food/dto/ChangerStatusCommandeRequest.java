package com.fast_food.dto;

import lombok.Data;

@Data
public class ChangerStatusCommandeRequest {
    private String status; // en_attente, en_preparation, prete, livree, annulee
}