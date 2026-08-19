package com.fast_food.mapper;

import org.springframework.stereotype.Component;
import com.fast_food.dto.ProduitMenuRequest;
import com.fast_food.dto.ProduitMenuResponse;
import com.fast_food.entite.Categorie;
import com.fast_food.entite.ProduitMenu;

@Component
public class ProduitMenuMapper {

    private final CategorieMapper categorieMapper;

    // Injection par constructeur du CategorieMapper
    public ProduitMenuMapper(CategorieMapper categorieMapper) {
        this.categorieMapper = categorieMapper;
    }

    public ProduitMenu toEntity(ProduitMenuRequest pmr) {
        if (pmr == null) {
            return null;
        }

        ProduitMenu pm = new ProduitMenu();
        pm.setNom(pmr.getNom());
        pm.setDescription(pmr.getDescription());
        pm.setPrix(pmr.getPrix());
        pm.setImageUrl(pmr.getImageUrl());
        
        // Gestion de la valeur par défaut si estDispo est nul à la création
        if (pmr.getEstDispo() != null) {
            pm.setEstDispo(pmr.getEstDispo());
        } else {
            pm.setEstDispo(true);
        }

        // On associe la catégorie via une entité temporaire possédant l'ID
        if (pmr.getIdCategorie() != null) {
            Categorie cat = new Categorie();
            cat.setId(pmr.getIdCategorie());
            pm.setCategorie(cat);
        }

        return pm;
    }

    public ProduitMenuResponse toProduitMenuResponse(ProduitMenu pm) { 
        if (pm == null) {
            return null;
        }

        ProduitMenuResponse pmr = new ProduitMenuResponse();
        pmr.setId(pm.getId());
        pmr.setNom(pm.getNom());
        pmr.setDescription(pm.getDescription());
        pmr.setPrix(pm.getPrix());
        pmr.setImageUrl(pm.getImageUrl()); 
        pmr.setEstDispo(pm.isEstDispo());         

        // Mapping de l'entité Categorie vers CategorieResponse
        if (pm.getCategorie() != null) {
            pmr.setCategorie(categorieMapper.toCategorieResponse(pm.getCategorie())); 
        }

        return pmr;
    }
}