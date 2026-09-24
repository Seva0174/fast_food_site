package com.fast_food.service;

import com.fast_food.dto.*;
import com.fast_food.entite.Employe;
import com.fast_food.entite.EmployeHeure;
import com.fast_food.entite.User;
import com.fast_food.exception.ResourceNotFoundException;
import com.fast_food.mapper.EmployeHeureMapper;
import com.fast_food.repositorie.EmployeHeureRepository;
import com.fast_food.repositorie.EmployeRepository;
import com.fast_food.repositorie.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeService {

    private final EmployeRepository employeRepository;
    private final EmployeHeureRepository employeHeureRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmployeHeureMapper employeHeureMapper;

    // ==========================================
    // GESTION DES EMPLOYES
    // ==========================================

    @Transactional(readOnly = true)
    public List<EmployeResponse> obtenirTousLesEmployes() {
        return employeRepository.findAll().stream().map(emp -> 
            EmployeResponse.builder()
                .id(emp.getId())
                .nom(emp.getNom())
                .email(emp.getUser() != null ? emp.getUser().getEmail() : null)
                .roleSysteme(emp.getUser() != null ? emp.getUser().getRole() : User.Role.employe)
                .role(emp.getRole() != null ? emp.getRole().name() : null)
                .salaireHeure(emp.getSalaire_heure())
                .build()
        ).toList();
    }

    @Transactional(readOnly = true)
    public EmployeResponse obtenirEmployeParId(Long id) {
        Employe employe = employeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable avec l'id : " + id));

        return EmployeResponse.builder()
                .id(employe.getId())
                .nom(employe.getNom())
                .email(employe.getUser() != null ? employe.getUser().getEmail() : null)
                .roleSysteme(employe.getUser() != null ? employe.getUser().getRole() : User.Role.employe)
                .role(employe.getRole() != null ? employe.getRole().name() : null)
                .salaireHeure(employe.getSalaire_heure())
                .build();
    }

    @Transactional
    public EmployeResponse creerEmploye(EmployeRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Un compte utilisateur existe déjà avec cet email.");
        }

        if (request.getRoleSysteme() == User.Role.client) {
            throw new IllegalArgumentException("Un employé ne peut pas avoir le rôle système client.");
        }

        User user = new User();
        user.setNom(request.getNom());
        user.setEmail(request.getEmail());
        
        // Le mot de passe est désormais strictement obligatoire
        if (request.getMdp() == null || request.getMdp().isBlank()) {
            throw new IllegalArgumentException("Le mot de passe est obligatoire.");
        }
        user.setMdp(passwordEncoder.encode(request.getMdp()));
        
        user.setRole(request.getRoleSysteme() != null ? request.getRoleSysteme() : User.Role.employe);
        user.setEstVerif(true);
        user.setDateCreation(LocalDateTime.now());
        User userSauvegarde = userRepository.save(user);

        Employe employe = new Employe();
        employe.setUser(userSauvegarde);
        employe.setNom(request.getNom());
        
        if (request.getRole() != null && !request.getRole().isBlank()) {
            employe.setRole(Employe.Role.valueOf(request.getRole().toUpperCase()));
        }
        
        employe.setSalaire_heure(request.getSalaireHeure());
        Employe employeSauvegarde = employeRepository.save(employe);

        return EmployeResponse.builder()
                .id(employeSauvegarde.getId())
                .nom(employeSauvegarde.getNom())
                .email(userSauvegarde.getEmail())
                .roleSysteme(userSauvegarde.getRole())
                .role(employeSauvegarde.getRole() != null ? employeSauvegarde.getRole().name() : null)
                .salaireHeure(employeSauvegarde.getSalaire_heure())
                .build();
    }

    @Transactional
    public EmployeResponse modifierEmploye(Long id, EmployeRequest request) {
        Employe employe = employeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable avec l'id : " + id));

        employe.setNom(request.getNom());
        
        // Conversion String -> Enum Employe.Role
        if (request.getRole() != null && !request.getRole().isBlank()) {
            employe.setRole(Employe.Role.valueOf(request.getRole().toUpperCase()));
        }
        
        employe.setSalaire_heure(request.getSalaireHeure());

        // Mise à jour du User lié
        User user = employe.getUser();
        if (user != null) {
            user.setNom(request.getNom());
            if (request.getRoleSysteme() != null) {
                user.setRole(request.getRoleSysteme());
            }
            userRepository.save(user);
        }

        Employe misAJour = employeRepository.save(employe);

        return EmployeResponse.builder()
                .id(misAJour.getId())
                .nom(misAJour.getNom())
                .email(user != null ? user.getEmail() : null)
                .roleSysteme(user != null ? user.getRole() : request.getRoleSysteme())
                .role(misAJour.getRole() != null ? misAJour.getRole().name() : null)
                .salaireHeure(misAJour.getSalaire_heure())
                .build();
    }

    @Transactional
    public void supprimerEmploye(Long id) {
        Employe employe = employeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable avec l'id : " + id));
        
        if (employe.getUser() != null) {
            userRepository.delete(employe.getUser());
        } else {
            employeRepository.delete(employe);
        }
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