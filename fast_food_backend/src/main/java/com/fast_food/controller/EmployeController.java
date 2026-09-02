package com.fast_food.controller;

import com.fast_food.dto.*;
import com.fast_food.service.EmployeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/employes")
@RequiredArgsConstructor
public class EmployeController {

    private final EmployeService employeService;

    // ==========================================
    // ENDPOINTS GESTION DES EMPLOYES
    // ==========================================

    @GetMapping
    public ResponseEntity<List<EmployeResponse>> obtenirTousLesEmployes() {
        return ResponseEntity.ok(employeService.obtenirTousLesEmployes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeResponse> obtenirEmployeParId(@PathVariable Long id) {
        return ResponseEntity.ok(employeService.obtenirEmployeParId(id));
    }

    @PostMapping
    public ResponseEntity<EmployeResponse> creerEmploye(@Valid @RequestBody EmployeRequest request) {
        EmployeResponse nouveauEmploye = employeService.creerEmploye(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nouveauEmploye);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeResponse> modifierEmploye(
            @PathVariable Long id,
            @Valid @RequestBody EmployeRequest request) {
        return ResponseEntity.ok(employeService.modifierEmploye(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerEmploye(@PathVariable Long id) {
        employeService.supprimerEmploye(id);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // ENDPOINTS SAISIE ET CONSULTATION DES HEURES
    // ==========================================

    @PostMapping("/heures")
    public ResponseEntity<EmployeHeureResponse> enregistrerHeures(@Valid @RequestBody EmployeHeureRequest request) {
        EmployeHeureResponse heureSaisie = employeService.enregistrerHeures(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(heureSaisie);
    }

    @GetMapping("/{id}/heures")
    public ResponseEntity<List<EmployeHeureResponse>> obtenirHeuresParEmploye(@PathVariable Long id) {
        return ResponseEntity.ok(employeService.obtenirHeuresParEmploye(id));
    }

    @GetMapping("/{id}/heures/periode")
    public ResponseEntity<List<EmployeHeureResponse>> obtenirHeuresParEmployeEtPeriode(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(employeService.obtenirHeuresParEmployeEtPeriode(id, debut, fin));
    }

    @DeleteMapping("/heures/{idHeure}")
    public ResponseEntity<Void> supprimerSaisieHeure(@PathVariable Long idHeure) {
        employeService.supprimerSaisieHeure(idHeure);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // ENDPOINT BILAN SALAIRE MENSUEL
    // ==========================================

    @GetMapping("/{id}/salaire")
    public ResponseEntity<EmployeSalaireResponse> calculerSalaireMensuel(
            @PathVariable Long id,
            @RequestParam int annee,
            @RequestParam int mois) {
        return ResponseEntity.ok(employeService.calculerSalaireMensuel(id, annee, mois));
    }
}