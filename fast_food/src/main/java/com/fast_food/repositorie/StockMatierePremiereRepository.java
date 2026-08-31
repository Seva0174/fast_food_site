package com.fast_food.repositorie;

import java.math.BigDecimal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fast_food.entite.StockMatierePremiere;

@Repository
public interface StockMatierePremiereRepository extends JpaRepository<StockMatierePremiere,Long>{
    @Modifying
    @Query("""
        UPDATE StockMatierePremiere s
        SET s.quantite = s.quantite - :quantite
        WHERE s.id = :id AND s.quantite >= :quantite
    """)
    int decrementStock(@Param("id") Long id, @Param("quantite") BigDecimal quantite);
}
