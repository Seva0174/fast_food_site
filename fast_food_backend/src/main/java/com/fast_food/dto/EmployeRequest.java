package com.fast_food.dto;

import com.fast_food.entite.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class EmployeRequest {
    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;

    //@NotBlank(message = "Le mot de passe est obligatoire")
    private String mdp; 

    @NotNull(message = "Le rôle d'accès système est obligatoire")
    private User.Role roleSysteme; // admin, client, employe
    private String role;
    @NotNull(message = "Le salaire horaire est obligatoire")
    private BigDecimal salaireHeure;
}