package com.fast_food.service;

import com.fast_food.dto.*;
import com.fast_food.entite.Employe;
import com.fast_food.entite.EmployeHeure;
import com.fast_food.exception.ResourceNotFoundException;
import com.fast_food.mapper.EmployeHeureMapper;
import com.fast_food.mapper.EmployeMapper;
import com.fast_food.repositorie.EmployeHeureRepository;
import com.fast_food.repositorie.EmployeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeService {

    private final EmployeRepository employeRepository;
    private final EmployeHeureRepository employeHeureRepository;
    private final EmployeMapper employeMapper;
    private final EmployeHeureMapper employeHeureMapper;

    // ==========================================
    // GESTION DES EMPLOYES
    // ==========================================

    @Transactional(readOnly = true)
    public List<EmployeResponse> obtenirTousLesEmployes() {
        return employeRepository.findAll()
                .stream()
                .map(employeMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public EmployeResponse obtenirEmployeParId(Long id) {
        Employe employe = employeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable avec l'id : " + id));
        return employeMapper.toResponse(employe);
    }

    @Transactional
    public EmployeResponse creerEmploye(EmployeRequest request) {
        Employe employe = employeMapper.toEntity(request);
        Employe employeSauvegarde = employeRepository.save(employe);
        return employeMapper.toResponse(employeSauvegarde);
    }

    @Transactional
    public EmployeResponse modifierEmploye(Long id, EmployeRequest request) {
        Employe employe = employeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable avec l'id : " + id));

        employeMapper.updateEntityFromRequest(request, employe);
        Employe employeMisAJour = employeRepository.save(employe);
        return employeMapper.toResponse(employeMisAJour);
    }

    @Transactional
    public void supprimerEmploye(Long id) {
        if (!employeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employé introuvable avec l'id : " + id);
        }
        employeRepository.deleteById(id);
    }

    // ==========================================
    // SAISIE ET SUIVI DES HEURES
    // ==========================================

    @Transactional
    public EmployeHeureResponse enregistrerHeures(EmployeHeureRequest request) {
        Employe employe = employeRepository.findById(request.getEmployeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable avec l'id : " + request.getEmployeId()));

        EmployeHeure employeHeure = employeHeureMapper.toEntity(request, employe);
        EmployeHeure heureSauvegardee = employeHeureRepository.save(employeHeure);
        return employeHeureMapper.toResponse(heureSauvegardee);
    }

    @Transactional(readOnly = true)
    public List<EmployeHeureResponse> obtenirHeuresParEmploye(Long employeId) {
        if (!employeRepository.existsById(employeId)) {
            throw new ResourceNotFoundException("Employé introuvable avec l'id : " + employeId);
        }
        return employeHeureRepository.findByEmployeId(employeId)
                .stream()
                .map(employeHeureMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EmployeHeureResponse> obtenirHeuresParEmployeEtPeriode(Long employeId, LocalDate debut, LocalDate fin) {
        if (!employeRepository.existsById(employeId)) {
            throw new ResourceNotFoundException("Employé introuvable avec l'id : " + employeId);
        }
        return employeHeureRepository.findByEmployeIdAndDateBetween(employeId, debut, fin)
                .stream()
                .map(employeHeureMapper::toResponse)
                .toList();
    }

    @Transactional
    public void supprimerSaisieHeure(Long idHeure) {
        if (!employeHeureRepository.existsById(idHeure)) {
            throw new ResourceNotFoundException("Saisie d'heure introuvable avec l'id : " + idHeure);
        }
        employeHeureRepository.deleteById(idHeure);
    }

    // ==========================================
    // CALCUL DU SALAIRE ET BILAN MENSUEL
    // ==========================================

    @Transactional(readOnly = true)
    public EmployeSalaireResponse calculerSalaireMensuel(Long employeId, int annee, int mois) {
        Employe employe = employeRepository.findById(employeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable avec l'id : " + employeId));

        YearMonth yearMonth = YearMonth.of(annee, mois);
        LocalDate debut = yearMonth.atDay(1);
        LocalDate fin = yearMonth.atEndOfMonth();

        List<EmployeHeure> heuresDuMois = employeHeureRepository.findByEmployeIdAndDateBetween(employeId, debut, fin);

        BigDecimal totalHeures = heuresDuMois.stream()
                .map(EmployeHeure::getNbHeure)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal salaireHeure = employe.getSalaire_heure() != null ? employe.getSalaire_heure() : BigDecimal.ZERO;
        BigDecimal salaireTotal = totalHeures.multiply(salaireHeure);

        return EmployeSalaireResponse.builder()
                .employeId(employe.getId())
                .employeNom(employe.getNom())
                .role(employe.getRole() != null ? employe.getRole().name() : null)
                .totalHeures(totalHeures)
                .salaireHeure(salaireHeure)
                .salaireTotalEstime(salaireTotal)
                .build();
    }
}