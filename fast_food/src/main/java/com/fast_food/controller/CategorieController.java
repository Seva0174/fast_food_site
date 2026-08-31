package com.fast_food.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fast_food.dto.CategorieRequest;
import com.fast_food.dto.CategorieResponse;
import com.fast_food.service.CategorieService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategorieController {

    private final CategorieService categorieService;

    // Récupérer toutes les catégories (Public)
    @GetMapping
    public ResponseEntity<List<CategorieResponse>> getAllCategories() {
        return ResponseEntity.ok(categorieService.getAllCategories());
    }

    // Récupérer une catégorie par ID (Public)
    @GetMapping("/{id}")
    public ResponseEntity<CategorieResponse> getCategorieById(@PathVariable Long id) {
        return ResponseEntity.ok(categorieService.getCategorieById(id));
    }

    // Créer une catégorie (Admin)
    @PostMapping
    public ResponseEntity<CategorieResponse> createCategorie(@Valid @RequestBody CategorieRequest request) {
        CategorieResponse createdCategorie = categorieService.createCategorie(request);
        return new ResponseEntity<>(createdCategorie, HttpStatus.CREATED);
    }

    // Modifier une catégorie (Admin)
    @PutMapping("/{id}")
    public ResponseEntity<CategorieResponse> updateCategorie(
            @PathVariable Long id,
            @Valid @RequestBody CategorieRequest request) {
        return ResponseEntity.ok(categorieService.updateCategorie(id, request));
    }

    // Supprimer une catégorie (Admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategorie(@PathVariable Long id) {
        categorieService.deleteCategorie(id);
        return ResponseEntity.noContent().build();
    }
}