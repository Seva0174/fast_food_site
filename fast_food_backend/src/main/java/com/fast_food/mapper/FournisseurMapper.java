package com.fast_food.mapper;

import com.fast_food.dto.FournisseurRequest;
import com.fast_food.dto.FournisseurResponse;
import com.fast_food.entite.Fournisseur;
import org.springframework.stereotype.Component;

@Component
public class FournisseurMapper {

    public Fournisseur toEntity(FournisseurRequest request) {
        Fournisseur f = new Fournisseur();
        f.setNom(request.getNom());
        return f;
    }

    public FournisseurResponse toResponse(Fournisseur entity) {
        FournisseurResponse dto = new FournisseurResponse();
        dto.setId(entity.getId());
        dto.setNom(entity.getNom());
        return dto;
    }
}