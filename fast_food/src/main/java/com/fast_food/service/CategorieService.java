package com.fast_food.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fast_food.dto.CategorieRequest;
import com.fast_food.dto.CategorieResponse;
import com.fast_food.entite.Categorie;
import com.fast_food.exception.ResourceNotFoundException;
import com.fast_food.mapper.CategorieMapper;
import com.fast_food.repositorie.CategorieRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategorieService {

    private final CategorieRepository categorieRepository;
    private final CategorieMapper categorieMapper;

    // Récupérer toutes les catégories
    @Transactional(readOnly = true)
    public List<CategorieResponse> getAllCategories() {
        return categorieRepository.findAll().stream()
                .map(categorieMapper::toCategorieResponse)
                .collect(Collectors.toList());
    }

    // Récupérer une catégorie par son ID
    @Transactional(readOnly = true)
    public CategorieResponse getCategorieById(Long id) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable avec l'ID : " + id));
        return categorieMapper.toCategorieResponse(categorie);
    }

    // Créer une nouvelle catégorie (Réservé Admin)
    @Transactional
    public CategorieResponse createCategorie(CategorieRequest request) {
        Categorie categorie = categorieMapper.toEntity(request);
        Categorie savedCategorie = categorieRepository.save(categorie);
        return categorieMapper.toCategorieResponse(savedCategorie);
    }

    // Modifier une catégorie existante (Réservé Admin)
    @Transactional
    public CategorieResponse updateCategorie(Long id, CategorieRequest request) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable avec l'ID : " + id));

        categorie.setNom(request.getNom());
        Categorie updatedCategorie = categorieRepository.save(categorie);
        return categorieMapper.toCategorieResponse(updatedCategorie);
    }

    // Supprimer une catégorie (Réservé Admin)
    @Transactional
    public void deleteCategorie(Long id) {
        if (!categorieRepository.existsById(id)) {
            throw new ResourceNotFoundException("Catégorie introuvable avec l'ID : " + id);
        }
        categorieRepository.deleteById(id);
    }
}