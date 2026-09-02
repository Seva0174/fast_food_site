package com.fast_food.repositorie;

import com.fast_food.entite.CommandeFournisseur;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommandeFournisseurRepository extends JpaRepository<CommandeFournisseur, Long> {
    // Dépenses globales en matières premières (commandes reçues ou expédiées)
    @Query("SELECT SUM(d.quantite * d.prixUnitaire) FROM CommandeFournisseurDetail d " +
        "WHERE d.commandeFournisseur.status IN ('expediee', 'recue')")
    BigDecimal calculateTotalDepensesApprovisionnement();

    // Dépenses sur une période
    @Query("SELECT SUM(d.quantite * d.prixUnitaire) FROM CommandeFournisseurDetail d " +
        "WHERE d.commandeFournisseur.status IN ('expediee', 'recue') " +
        "AND d.commandeFournisseur.dateCommande BETWEEN :debut AND :fin")
    BigDecimal calculateDepensesApprovisionnementEntre(@Param("debut") LocalDate debut, @Param("fin") LocalDate fin);
}