package com.fast_food.dto;

import lombok.Data;

@Data
public class CreerCommandeRequest {
    private String cpRue;
    private String cpVille;
    private String cpCodePostal;
}