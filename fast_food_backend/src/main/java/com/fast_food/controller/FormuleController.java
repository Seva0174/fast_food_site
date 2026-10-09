package com.fast_food.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fast_food.dto.FormuleGroupeProduitRequest;
import com.fast_food.dto.FormuleGroupeRequest;
import com.fast_food.dto.FormuleGroupeResponse;
import com.fast_food.service.FormuleService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/formules")
@RequiredArgsConstructor
public class FormuleController {

    private final FormuleService formuleService;

    // Emplacements d'une formule
    @GetMapping("/{idFormule}/groupes")
    public ResponseEntity<List<FormuleGroupeResponse>> getGroupes(@PathVariable("idFormule") Long idFormule) {
        return ResponseEntity.ok(formuleService.getGroupesByFormule(idFormule));
    }

    @PostMapping("/{idFormule}/groupes")
    public ResponseEntity<FormuleGroupeResponse> creerGroupe(@PathVariable("idFormule") Long idFormule,
                                                             @RequestBody FormuleGroupeRequest request) {
        return ResponseEntity.ok(formuleService.creerGroupe(idFormule, request));
    }

    @PutMapping("/groupes/{idGroupe}")
    public ResponseEntity<FormuleGroupeResponse> modifierGroupe(@PathVariable("idGroupe") Long idGroupe,
                                                                @RequestBody FormuleGroupeRequest request) {
        return ResponseEntity.ok(formuleService.modifierGroupe(idGroupe, request));
    }

    @DeleteMapping("/groupes/{idGroupe}")
    public ResponseEntity<Void> supprimerGroupe(@PathVariable("idGroupe") Long idGroupe) {
        formuleService.supprimerGroupe(idGroupe);
        return ResponseEntity.noContent().build();
    }

    // Produits proposés dans un emplacement
    @PostMapping("/groupes/{idGroupe}/produits")
    public ResponseEntity<FormuleGroupeResponse> ajouterProduit(@PathVariable("idGroupe") Long idGroupe,
                                                                @RequestBody FormuleGroupeProduitRequest request) {
        return ResponseEntity.ok(formuleService.ajouterProduit(idGroupe, request));
    }

    @PutMapping("/produits/{idLien}")
    public ResponseEntity<FormuleGroupeResponse> modifierSurcout(@PathVariable("idLien") Long idLien,
                                                                 @RequestBody FormuleGroupeProduitRequest request) {
        return ResponseEntity.ok(formuleService.modifierSurcout(idLien, request));
    }

    @DeleteMapping("/produits/{idLien}")
    public ResponseEntity<FormuleGroupeResponse> retirerProduit(@PathVariable("idLien") Long idLien) {
        return ResponseEntity.ok(formuleService.retirerProduit(idLien));
    }
}