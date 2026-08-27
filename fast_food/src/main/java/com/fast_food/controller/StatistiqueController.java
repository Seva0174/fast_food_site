package com.fast_food.controller;

import com.fast_food.dto.StatistiquesGlobalesResponse;
import com.fast_food.dto.VenteProduitStatResponse;
import com.fast_food.service.StatistiqueService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/statistiques")
@RequiredArgsConstructor
public class StatistiqueController {

    private final StatistiqueService statistiqueService;

    // Récupérer le bilan global (CA, dépenses approvisionnement, masse salariale, bénéfice)
    @GetMapping("/globales")
    public ResponseEntity<StatistiquesGlobalesResponse> obtenirStatistiquesGlobales() {
        return ResponseEntity.ok(statistiqueService.obtenirStatistiquesGlobales());
    }

    // Récupérer le bilan filtré sur une période spécifique
    @GetMapping("/periode")
    public ResponseEntity<StatistiquesGlobalesResponse> obtenirStatistiquesParPeriode(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(statistiqueService.obtenirStatistiquesParPeriode(debut, fin));
    }

    // Récupérer la liste des produits les plus vendus
    @GetMapping("/ventes-produits")
    public ResponseEntity<List<VenteProduitStatResponse>> obtenirTopProduitsVendus() {
        return ResponseEntity.ok(statistiqueService.obtenirTopProduitsVendus());
    }
}