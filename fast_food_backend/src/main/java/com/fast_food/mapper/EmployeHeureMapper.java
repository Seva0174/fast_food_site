package com.fast_food.mapper;

import com.fast_food.dto.EmployeHeureRequest;
import com.fast_food.dto.EmployeHeureResponse;
import com.fast_food.entite.Employe;
import com.fast_food.entite.EmployeHeure;
import org.springframework.stereotype.Component;

@Component
public class EmployeHeureMapper {

    public EmployeHeureResponse toResponse(EmployeHeure entity) {
        if (entity == null) return null;

        return EmployeHeureResponse.builder()
                .id(entity.getId())
                .nbHeure(entity.getNbHeure())
                .date(entity.getDate())
                .employeId(entity.getEmploye() != null ? entity.getEmploye().getId() : null)
                .employeNom(entity.getEmploye() != null ? entity.getEmploye().getNom() : null)
                .build();
    }

    public EmployeHeure toEntity(EmployeHeureRequest request, Employe employe) {
        if (request == null) return null;

        EmployeHeure entity = new EmployeHeure();
        entity.setEmploye(employe);
        entity.setNbHeure(request.getNbHeure());
        entity.setDate(request.getDate());

        return entity;
    }
}