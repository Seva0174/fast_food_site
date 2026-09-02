package com.fast_food.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    
    @Builder.Default
    private String type = "Bearer"; // Type de token standard
    
    //user info
    private Long id;
    private String email;
    private String nom;
    private String role; // "CLIENT" ou "ADMIN"
}
