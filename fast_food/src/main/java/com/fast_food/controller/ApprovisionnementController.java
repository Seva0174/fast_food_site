package com.fast_food.controller;

import com.fast_food.dto.*;
import com.fast_food.service.ApprovisionnementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/approvisionnement")
@RequiredArgsConstructor
public class ApprovisionnementController {

    private final ApprovisionnementService approvisionnementService;

    // --- FOURNISSEURS ---

    @GetMapping("/fournisseurs")
    public ResponseEntity<List<FournisseurResponse>> getAllFournisseurs() {
        return ResponseEntity.ok(approvisionnementService.getAllFournisseurs());
    }

    @PostMapping("/fournisseurs")
    public ResponseEntity<FournisseurResponse> createFournisseur(@Valid @RequestBody FournisseurRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(approvisionnementService.createFournisseur(request));
    }

    // --- CATALOGUE ---

    @PostMapping("/catalogue")
    public ResponseEntity<CatalogueFournisseurResponse> ajouterArticleCatalogue(@Valid @RequestBody CatalogueFournisseurRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(approvisionnementService.ajouterArticleCatalogue(request));
    }

    @GetMapping("/fournisseurs/{idFournisseur}/catalogue")
    public ResponseEntity<List<CatalogueFournisseurResponse>> getCatalogueByFournisseur(@PathVariable Long idFournisseur) {
        return ResponseEntity.ok(approvisionnementService.getCatalogueByFournisseur(idFournisseur));
    }

    // --- COMMANDES FOURNISSEURS ---

    @GetMapping("/commandes")
    public ResponseEntity<List<CommandeFournisseurResponse>> getAllCommandes() {
        return ResponseEntity.ok(approvisionnementService.getAllCommandes());
    }

    @PostMapping("/commandes")
    public ResponseEntity<CommandeFournisseurResponse> passerCommande(@Valid @RequestBody CreerCommandeFournisseurRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(approvisionnementService.passerCommande(request));
    }

    @PatchMapping("/commandes/{id}/statut")
    public ResponseEntity<CommandeFournisseurResponse> changerStatutCommande(
            @PathVariable Long id,
            @Valid @RequestBody ChangerStatutCommandeFournisseurRequest request) {
        return ResponseEntity.ok(approvisionnementService.changerStatutCommande(id, request.getStatus()));
    }
}