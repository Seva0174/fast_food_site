package com.fast_food.controller;

import com.fast_food.dto.*;
import com.fast_food.service.ApprovisionnementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @DeleteMapping("/fournisseurs/{id}")
    public ResponseEntity<Void> deleteFournisseur(@PathVariable Long id) {
        approvisionnementService.deleteFournisseur(id);
        return ResponseEntity.noContent().build();
    }

    // --- CATALOGUE ---

    @GetMapping("/fournisseurs/{idFournisseur}/catalogue")
    public ResponseEntity<List<CatalogueFournisseurResponse>> getCatalogueByFournisseur(@PathVariable Long idFournisseur) {
        return ResponseEntity.ok(approvisionnementService.getCatalogueByFournisseur(idFournisseur));
    }

    @PostMapping(value = "/fournisseurs/{idFournisseur}/catalogue/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<CatalogueFournisseurResponse>> importerCatalogueCsv(
            @PathVariable Long idFournisseur,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(approvisionnementService.importerCatalogueCsv(idFournisseur, file));
    }

    @DeleteMapping("/fournisseurs/{idFournisseur}/catalogue")
    public ResponseEntity<Void> reinitialiserCatalogue(@PathVariable Long idFournisseur) {
        approvisionnementService.reinitialiserCatalogue(idFournisseur);
        return ResponseEntity.noContent().build();
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

    @GetMapping("/commandes/{id}/details")
    public ResponseEntity<List<CommandeDetailDTO>> getDetailsCommande(@PathVariable Long id) {
        List<CommandeDetailDTO> details = approvisionnementService.getDetailsCommande(id);
        return ResponseEntity.ok(details);
    }
}