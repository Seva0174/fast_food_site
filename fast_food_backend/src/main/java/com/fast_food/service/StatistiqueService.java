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
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatistiqueService {

    // Ordre des jours : l'indice 0 correspond au lundi (ISODOW = 1)
    private static final String[] JOURS = {"Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"};

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
        validerPeriode(debut, fin);
        LocalDateTime debutDateTime = debut.atStartOfDay();
        LocalDateTime finDateTime = fin.atTime(LocalTime.MAX);

        BigDecimal ca = commandeRepository.calculateChiffreAffairesEntre(debutDateTime, finDateTime);
        BigDecimal appro = commandeFournisseurRepository.calculateDepensesApprovisionnementEntre(debut, fin);
        BigDecimal salaires = employeHeureRepository.calculateMasseSalarialeEntre(debut, fin);
        Long totalCommandes = commandeRepository.countCommandesValidesEntre(debutDateTime, finDateTime);

        return statistiqueMapper.toGlobalesResponse(ca, appro, salaires, totalCommandes);
    }

    // Sans période (debut et fin nuls) : vue globale. Avec période : filtre sur la date de commande.
    @Transactional(readOnly = true)
    public List<VenteProduitStatResponse> obtenirTopProduitsVendus(LocalDate debut, LocalDate fin) {
        List<Object[]> resultats = periodeDemandee(debut, fin)
                ? commandeRepository.findTopProduitsVendusEntre(debut.atStartOfDay(), fin.atTime(LocalTime.MAX))
                : commandeRepository.findTopProduitsVendus();

        return resultats.stream()
                .map(row -> statistiqueMapper.toVenteProduitResponse(
                        (Long) row[0],
                        (String) row[1],
                        (Long) row[2],
                        (BigDecimal) row[3]
                ))
                .toList();
    }

    // Sans période (debut et fin nuls) : vue globale. Avec période : filtre sur la date de commande.
    @Transactional(readOnly = true)
    public List<CommandesParJourResponse> obtenirCommandesParJourSemaine(LocalDate debut, LocalDate fin) {
        List<Object[]> resultats = periodeDemandee(debut, fin)
                ? commandeRepository.countCommandesParJourSemaineEntre(debut.atStartOfDay(), fin.atTime(LocalTime.MAX))
                : commandeRepository.countCommandesParJourSemaine();

        return construireCommandesParJour(resultats);
    }

    // Remplit les sept jours, y compris ceux sans commande (compteur à zéro).
    private List<CommandesParJourResponse> construireCommandesParJour(List<Object[]> resultats) {
        long[] compteurs = new long[JOURS.length];

        for (Object[] row : resultats) {
            if (row[0] == null || row[1] == null) continue;
            int indice = ((Number) row[0]).intValue() - 1;
            if (indice >= 0 && indice < JOURS.length) {
                compteurs[indice] = ((Number) row[1]).longValue();
            }
        }

        List<CommandesParJourResponse> reponse = new ArrayList<>();
        for (int i = 0; i < JOURS.length; i++) {
            reponse.add(new CommandesParJourResponse(JOURS[i], compteurs[i]));
        }
        return reponse;
    }

    // Renvoie false si aucune date n'est fournie (vue globale), true si une période valide est fournie.
    private boolean periodeDemandee(LocalDate debut, LocalDate fin) {
        if (debut == null && fin == null) {
            return false;
        }
        validerPeriode(debut, fin);
        return true;
    }

    // Une période doit avoir deux dates, et la fin ne peut pas précéder le début.
    private void validerPeriode(LocalDate debut, LocalDate fin) {
        if (debut == null || fin == null) {
            throw new IllegalArgumentException("Les deux dates de la période sont requises.");
        }
        if (fin.isBefore(debut)) {
            throw new IllegalArgumentException("La date de fin doit être postérieure à la date de début.");
        }
    }
}