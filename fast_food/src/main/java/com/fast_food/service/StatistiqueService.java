package com.fast_food.service;

import com.fast_food.dto.StatistiquesGlobalesResponse;
import com.fast_food.dto.VenteProduitStatResponse;
import com.fast_food.mapper.StatistiqueMapper;
import com.fast_food.repositorie.CommandeFournisseurRepository;
import com.fast_food.repositorie.CommandeRepository;
import com.fast_food.repositorie.EmployeHeureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatistiqueService {

    private final CommandeRepository commandeRepository;
    private final CommandeFournisseurRepository commandeFournisseurRepository;
    private final EmployeHeureRepository employeHeureRepository;
    private final StatistiqueMapper statistiqueMapper;

    @Transactional(readOnly = true)
    public StatistiquesGlobalesResponse obtenirStatistiquesGlobales() {
        BigDecimal ca = commandeRepository.calculateTotalChiffreAffaires();
        BigDecimal appro = commandeFournisseurRepository.calculateTotalDepensesApprovisionnement();
        BigDecimal salaires = employeHeureRepository.calculateMasseSalarialeTotale();
        Long totalCommandes = commandeRepository.countCommandesValides();

        return statistiqueMapper.toGlobalesResponse(ca, appro, salaires, totalCommandes);
    }

    @Transactional(readOnly = true)
    public StatistiquesGlobalesResponse obtenirStatistiquesParPeriode(LocalDate debut, LocalDate fin) {
        LocalDateTime debutDateTime = debut.atStartOfDay();
        LocalDateTime finDateTime = fin.atTime(LocalTime.MAX);

        BigDecimal ca = commandeRepository.calculateChiffreAffairesEntre(debutDateTime, finDateTime);
        BigDecimal appro = commandeFournisseurRepository.calculateDepensesApprovisionnementEntre(debut, fin);
        BigDecimal salaires = employeHeureRepository.calculateMasseSalarialeEntre(debut, fin);
        Long totalCommandes = commandeRepository.countCommandesValides(); 

        return statistiqueMapper.toGlobalesResponse(ca, appro, salaires, totalCommandes);
    }

    @Transactional(readOnly = true)
    public List<VenteProduitStatResponse> obtenirTopProduitsVendus() {
        List<Object[]> resultats = commandeRepository.findTopProduitsVendus();

        return resultats.stream()
                .map(row -> statistiqueMapper.toVenteProduitResponse(
                        (Long) row[0],
                        (String) row[1],
                        (Long) row[2],
                        (BigDecimal) row[3]
                ))
                .toList();
    }
}