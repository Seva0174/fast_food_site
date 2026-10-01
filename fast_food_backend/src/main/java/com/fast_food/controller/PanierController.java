package com.fast_food.controller;

import com.fast_food.dto.AjouterProduitRequest;
import com.fast_food.dto.ModifierQuantiteRequest;
import com.fast_food.dto.PanierResponse;
import com.fast_food.entite.User;
import com.fast_food.repositorie.UserRepository;
import com.fast_food.service.PanierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/panier")
@RequiredArgsConstructor
public class PanierController {

    private final PanierService panierService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));
    }

    @GetMapping
    public ResponseEntity<PanierResponse> getPanier(Authentication authentication) {
        return ResponseEntity.ok(panierService.getPanierByUser(getAuthenticatedUser(authentication)));
    }

    @PostMapping("/items")
    public ResponseEntity<PanierResponse> ajouterProduit(
            Authentication authentication,
            @RequestBody AjouterProduitRequest request) {
        return ResponseEntity.ok(panierService.ajouterProduit(getAuthenticatedUser(authentication), request));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<PanierResponse> modifierQuantite(
            Authentication authentication,
            @PathVariable Long itemId,
            @RequestBody ModifierQuantiteRequest request) {
        return ResponseEntity.ok(panierService.modifierQuantite(getAuthenticatedUser(authentication), itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<PanierResponse> supprimerItem(
            Authentication authentication,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(panierService.supprimerItem(getAuthenticatedUser(authentication), itemId));
    }

    @DeleteMapping
    public ResponseEntity<Void> viderPanier(Authentication authentication) {
        panierService.viderPanier(getAuthenticatedUser(authentication));
        return ResponseEntity.noContent().build();
    }
}