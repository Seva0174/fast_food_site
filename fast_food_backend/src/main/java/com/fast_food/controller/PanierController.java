package com.fast_food.controller;

import com.fast_food.dto.AjouterProduitRequest;
import com.fast_food.dto.ModifierQuantiteRequest;
import com.fast_food.dto.PanierResponse;
import com.fast_food.entite.User;
import com.fast_food.service.PanierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/panier")
@RequiredArgsConstructor
public class PanierController {

    private final PanierService panierService;

    @GetMapping
    public ResponseEntity<PanierResponse> getPanier(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(panierService.getPanierByUser(user));
    }

    @PostMapping("/items")
    public ResponseEntity<PanierResponse> ajouterProduit(
            @AuthenticationPrincipal User user,
            @RequestBody AjouterProduitRequest request) {
        return ResponseEntity.ok(panierService.ajouterProduit(user, request));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<PanierResponse> modifierQuantite(
            @AuthenticationPrincipal User user,
            @PathVariable Long itemId,
            @RequestBody ModifierQuantiteRequest request) {
        return ResponseEntity.ok(panierService.modifierQuantite(user, itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<PanierResponse> supprimerItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(panierService.supprimerItem(user, itemId));
    }

    @DeleteMapping
    public ResponseEntity<Void> viderPanier(@AuthenticationPrincipal User user) {
        panierService.viderPanier(user);
        return ResponseEntity.noContent().build();
    }
}