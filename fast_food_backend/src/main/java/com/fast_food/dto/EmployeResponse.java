package com.fast_food.dto;

import com.fast_food.entite.User;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class EmployeResponse {
    private Long id;
    private String nom;
    private String email;
    private User.Role roleSysteme; // Role utilisateur (admin, client, employe)
    private String role;           // Poste de travail
    private BigDecimal salaireHeure;
}