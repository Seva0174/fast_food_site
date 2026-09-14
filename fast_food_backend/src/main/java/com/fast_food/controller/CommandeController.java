package com.fast_food.controller;

import com.fast_food.dto.ChangerStatusCommandeRequest;
import com.fast_food.dto.CommandeResponse;
import com.fast_food.dto.CreerCommandeRequest;
import com.fast_food.entite.User;
import com.fast_food.service.CommandeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/commandes")
@RequiredArgsConstructor
public class CommandeController {

    private final CommandeService commandeService;
    
    //Récupère toutes les commandes du site (Réservé admin ou employe)
    @GetMapping("/admin/toutes")
    @PreAuthorize("hasRole('admin') or hasRole('employe')")
    public ResponseEntity<List<CommandeResponse>> getAllCommandes() {
        return ResponseEntity.ok(commandeService.getAllCommandes());
    }
    //Valide le panier et passe la commande (Client connecté)
    @PostMapping
    public ResponseEntity<CommandeResponse> passerCommande(Authentication authentication,
                                                           @Valid @RequestBody CreerCommandeRequest request) {
        String email = authentication.getName();
        return ResponseEntity.ok(commandeService.passerCommandeByEmail(email, request));
    }


    //Récupère l'historique des commandes du client connecté
    @GetMapping("/mes-commandes")
    public ResponseEntity<List<CommandeResponse>> getMesCommandes(Authentication authentication) {
        String email = authentication.getName(); // Récupère l'email extrait du JWT
        return ResponseEntity.ok(commandeService.getMesCommandesByEmail(email));
    }

    
    
    //Met à jour le statut d'une commande (Réservé ADMIN ou EMPLOYE)
    @PatchMapping("/admin/{commandeId}/status")
    @PreAuthorize("hasRole('admin') or hasRole('employe')")
    public ResponseEntity<CommandeResponse> changerStatus(@PathVariable Long commandeId,
                                                        @Valid @RequestBody ChangerStatusCommandeRequest request) {
        return ResponseEntity.ok(commandeService.changerStatus(commandeId, request));
    }

    //Suivi d'une commande spécifique par son ID (Client propriétaire)
    @GetMapping("/{commandeId}")
    public ResponseEntity<CommandeResponse> getCommandeById(Authentication authentication, 
                                                            @PathVariable Long commandeId) {
        String email = authentication.getName();
        return ResponseEntity.ok(commandeService.getCommandeByIdAndEmail(email, commandeId));
    }
}