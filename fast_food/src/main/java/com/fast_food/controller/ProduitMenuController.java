package com.fast_food.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fast_food.dto.ProduitMenuRequest;
import com.fast_food.dto.ProduitMenuResponse;
import com.fast_food.service.ProduitMenuService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/produits")
@RequiredArgsConstructor
public class ProduitMenuController {

    private final ProduitMenuService produitMenuService;

    // Récupérer tous les produits ou filtrer par catégorie (Public)
    // Exemple : GET /api/produits ou GET /api/produits?categorieId=2
    @GetMapping
    public ResponseEntity<List<ProduitMenuResponse>> getAllProduits(
            @RequestParam(required = false) Long categorieId) {
        
        if (categorieId != null) {
            return ResponseEntity.ok(produitMenuService.getProduitsByCategorie(categorieId));
        }
        return ResponseEntity.ok(produitMenuService.getAllProduits());
    }

    // Récupérer un produit par ID (Public)
    @GetMapping("/{id}")
    public ResponseEntity<ProduitMenuResponse> getProduitById(@PathVariable Long id) {
        return ResponseEntity.ok(produitMenuService.getProduitById(id));
    }

    // Créer un produit (Admin)
    @PostMapping
    public ResponseEntity<ProduitMenuResponse> createProduit(@RequestBody ProduitMenuRequest request) {
        ProduitMenuResponse createdProduit = produitMenuService.createProduit(request);
        return new ResponseEntity<>(createdProduit, HttpStatus.CREATED);
    }

    // Modifier un produit (Admin)
    @PutMapping("/{id}")
    public ResponseEntity<ProduitMenuResponse> updateProduit(
            @PathVariable Long id,
            @RequestBody ProduitMenuRequest request) {
        return ResponseEntity.ok(produitMenuService.updateProduit(id, request));
    }

    // Activer/Désactiver la disponibilité d'un produit (Admin)
    // Exemple : PATCH /api/produits/5/disponibilite
    @PatchMapping("/{id}/disponibilite")
    public ResponseEntity<ProduitMenuResponse> toggleDisponibilite(@PathVariable Long id) {
        return ResponseEntity.ok(produitMenuService.toggleDisponibilite(id));
    }

    // Supprimer un produit (Admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduit(@PathVariable Long id) {
        produitMenuService.deleteProduit(id);
        return ResponseEntity.noContent().build();
    }
}