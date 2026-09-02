package com.fast_food.mapper;

import com.fast_food.dto.CatalogueFournisseurResponse;
import com.fast_food.entite.CatalogueFournisseur;
import org.springframework.stereotype.Component;

@Component
public class CatalogueFournisseurMapper {

    public CatalogueFournisseurResponse toResponse(CatalogueFournisseur entity) {
        CatalogueFournisseurResponse dto = new CatalogueFournisseurResponse();
        dto.setId(entity.getId());
        
        if (entity.getFournisseur() != null) {
            dto.setIdFournisseur(entity.getFournisseur().getId());
            dto.setFournisseurNom(entity.getFournisseur().getNom());
        }
        
        if (entity.getStock() != null) {
            dto.setIdStock(entity.getStock().getId());
            dto.setMatierePremiereNom(entity.getStock().getNom());
        }
        
        dto.setPrixUnitaire(entity.getPrixUnitaire());
        return dto;
    }
}