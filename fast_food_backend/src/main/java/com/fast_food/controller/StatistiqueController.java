package com.fast_food.controller;

import com.fast_food.dto.CommandesParJourResponse;
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

    // Bilan global (CA, dépenses approvisionnement, masse salariale, bénéfice)
    @GetMapping("/globales")
    public ResponseEntity<StatistiquesGlobalesResponse> obtenirStatistiquesGlobales() {
        return ResponseEntity.ok(statistiqueService.obtenirStatistiquesGlobales());
    }

    // Bilan filtré sur une période (les deux dates sont obligatoires)
    @GetMapping("/periode")
    public ResponseEntity<StatistiquesGlobalesResponse> obtenirStatistiquesParPeriode(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(statistiqueService.obtenirStatistiquesParPeriode(debut, fin));
    }

    // Produits les plus vendus. Période optionnelle : sans dates, vue globale.
    @GetMapping("/ventes-produits")
    public ResponseEntity<List<VenteProduitStatResponse>> obtenirTopProduitsVendus(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(statistiqueService.obtenirTopProduitsVendus(debut, fin));
    }

    // Commandes par jour de la semaine. Période optionnelle : sans dates, vue globale.
    @GetMapping("/commandes-par-jour")
    public ResponseEntity<List<CommandesParJourResponse>> obtenirCommandesParJourSemaine(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(statistiqueService.obtenirCommandesParJourSemaine(debut, fin));
    }
}