package com.fast_food.repositorie;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fast_food.entite.EmployeHeure;

@Repository
public interface EmployeHeureRepository extends JpaRepository<EmployeHeure,Long>{
    List<EmployeHeure> findByEmployeId(Long employeId);
    List<EmployeHeure> findByEmployeIdAndDateBetween(Long employeId, LocalDate dateDebut, LocalDate dateFin);
    List<EmployeHeure> findByDateBetween(LocalDate dateDebut, LocalDate dateFin);
    boolean existsByEmployeIdAndDate(Long employeId, LocalDate date);
    // Masse salariale totale (heures * salaire_heure de l'employé)
    @Query("SELECT SUM(eh.nbHeure * eh.employe.salaire_heure) FROM EmployeHeure eh")
    BigDecimal calculateMasseSalarialeTotale();

    // Masse salariale sur une période
    @Query("SELECT SUM(eh.nbHeure * eh.employe.salaire_heure) FROM EmployeHeure eh WHERE eh.date BETWEEN :debut AND :fin")
    BigDecimal calculateMasseSalarialeEntre(@Param("debut") LocalDate debut, @Param("fin") LocalDate fin);
}
