package com.fast_food.mapper;

import com.fast_food.dto.EmployeRequest;
import com.fast_food.dto.EmployeResponse;
import com.fast_food.entite.Employe;
import org.springframework.stereotype.Component;

@Component
public class EmployeMapper {

    public EmployeResponse toResponse(Employe entity) {
        if (entity == null) return null;

        return EmployeResponse.builder()
                .id(entity.getId())
                .nom(entity.getNom())
                .role(entity.getRole() != null ? entity.getRole().name() : null)
                .salaireHeure(entity.getSalaire_heure())
                .build();
    }

    public Employe toEntity(EmployeRequest request) {
        if (request == null) return null;

        Employe entity = new Employe();
        entity.setNom(request.getNom());
        if (request.getRole() != null) {
            entity.setRole(Employe.Role.valueOf(request.getRole().toUpperCase()));
        }
        entity.setSalaire_heure(request.getSalaireHeure());

        return entity;
    }

    public void updateEntityFromRequest(EmployeRequest request, Employe entity) {
        if (request == null || entity == null) return;

        entity.setNom(request.getNom());
        if (request.getRole() != null) {
            entity.setRole(Employe.Role.valueOf(request.getRole().toUpperCase()));
        }
        entity.setSalaire_heure(request.getSalaireHeure());
    }
}