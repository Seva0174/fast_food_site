package com.fast_food.service;

import com.fast_food.dto.CommandesParJourResponse;
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
        // System.out.println("ICICI : " + ca + "\n\n\n\n\n");
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
        Long totalCommandes = commandeRepository.countCommandesValidesEntre(debutDateTime,finDateTime);

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

    @Transactional(readOnly = true)
    public List<CommandesParJourResponse> obtenirCommandesParJourSemaine() {
        List<Object[]> resultats = commandeRepository.countCommandesParJourSemaine();
        
        String[] joursNoms = {"Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"};
        Long[] counts = new Long[7];
        java.util.Arrays.fill(counts, 0L);

        if (resultats != null) {
            for (Object[] row : resultats) {
                if (row[0] != null && row[1] != null) {
                    int jourIndex = ((Number) row[0]).intValue() - 1; // 1 (Lundi) .. 7 (Dimanche) -> 0 .. 6
                    Long count = ((Number) row[1]).longValue();
                    
                    if (jourIndex >= 0 && jourIndex < 7) {
                        counts[jourIndex] = count;
                    }
                }
            }
        }

        List<CommandesParJourResponse> response = new java.util.ArrayList<>();
        for (int i = 0; i < 7; i++) {
            response.add(new CommandesParJourResponse(joursNoms[i], counts[i]));
        }
        return response;
    }
}