package com.fast_food.mapper;

import org.springframework.stereotype.Component;
import com.fast_food.dto.CategorieRequest;
import com.fast_food.dto.CategorieResponse;
import com.fast_food.entite.Categorie;

@Component
public class CategorieMapper {

    public Categorie toEntity(CategorieRequest request) {
        if (request == null) {
            return null;
        }

        Categorie c = new Categorie();
        c.setNom(request.getNom());
        return c;
    }

    public CategorieResponse toCategorieResponse(Categorie c) {
        if (c == null) {
            return null;
        }

        CategorieResponse cr = new CategorieResponse();
        cr.setId(c.getId()); 
        cr.setNom(c.getNom());
        return cr;
    }
}