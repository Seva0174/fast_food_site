package com.fast_food.mapper;

import com.fast_food.dto.AuthResponse;
import com.fast_food.dto.RegisterRequest;
import com.fast_food.entite.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class UserMapper {

    /**
     * Convertit un RegisterRequest en entité User pour l'enregistrement.
     */
    public User toEntity(RegisterRequest request) {
        if (request == null) {
            return null;
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setMdp(request.getMdp());
        user.setNom(request.getNom());
        user.setDateCreation(LocalDateTime.now());
        user.setEstVerif(false);
        // client par default
        user.setRole(User.Role.CLIENT); 

        return user;
    }

    /**
     * Convertit l'entité User et le token JWT généré -> AuthResponse pour le client.
     */
    public AuthResponse toAuthResponse(User user, String jwtToken) {
        if (user == null) {
            return null;
        }
        
        return AuthResponse.builder()
                .token(jwtToken)
                .type("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .nom(user.getNom())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .build();
    }
}