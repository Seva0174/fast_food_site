package com.fast_food.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fast_food.dto.OptionGroupeRequest;
import com.fast_food.dto.OptionGroupeResponse;
import com.fast_food.dto.OptionItemRequest;
import com.fast_food.dto.OptionItemResponse;
import com.fast_food.service.OptionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/options")
@RequiredArgsConstructor
public class OptionController {

    private final OptionService optionService;

    // --- GROUPES D'OPTIONS ---

    // Récupérer tous les groupes d'options d'un produit (Public)
    @GetMapping("/produit/{produitId}")
    public ResponseEntity<List<OptionGroupeResponse>> getGroupesByProduit(@PathVariable Long produitId) {
        return ResponseEntity.ok(optionService.getGroupesByProduit(produitId));
    }

    // Créer un groupe d'options pour un produit (Admin)
    @PostMapping("/produit/{produitId}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<OptionGroupeResponse> createGroupe(
            @PathVariable Long produitId,
            @Valid @RequestBody OptionGroupeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(optionService.createGroupe(produitId, request));
    }

    // Modifier un groupe d'options (Admin)
    @PutMapping("/groupes/{groupeId}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<OptionGroupeResponse> updateGroupe(
            @PathVariable Long groupeId,
            @Valid @RequestBody OptionGroupeRequest request) {
        return ResponseEntity.ok(optionService.updateGroupe(groupeId, request));
    }

    // Supprimer un groupe d'options (Admin)
    @DeleteMapping("/groupes/{groupeId}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Void> deleteGroupe(@PathVariable Long groupeId) {
        optionService.deleteGroupe(groupeId);
        return ResponseEntity.noContent().build();
    }

    // --- ITEMS D'OPTION ---

    // Ajouter une option dans un groupe (Admin)
    @PostMapping("/groupes/{groupeId}/items")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<OptionItemResponse> createItem(
            @PathVariable Long groupeId,
            @Valid @RequestBody OptionItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(optionService.createItem(groupeId, request));
    }

    // Modifier une option (Admin)
    @PutMapping("/items/{itemId}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<OptionItemResponse> updateItem(
            @PathVariable Long itemId,
            @Valid @RequestBody OptionItemRequest request) {
        return ResponseEntity.ok(optionService.updateItem(itemId, request));
    }

    // Supprimer une option (Admin)
    @DeleteMapping("/items/{itemId}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        optionService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }
}