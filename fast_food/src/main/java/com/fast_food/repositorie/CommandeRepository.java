package com.fast_food.repositorie;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fast_food.entite.Commande;
import com.fast_food.entite.User;

@Repository
public interface CommandeRepository extends JpaRepository<Commande,Long>{
    List<Commande> findByUserOrderByDateCreationDesc(User user);
    List<Commande> findAllByOrderByDateCreationDesc();
    // Chiffre d'affaires global (sur commandes non annulées)
    @Query("SELECT SUM(c.total) FROM Commande c WHERE c.status <> 'annulee'")
    BigDecimal calculateTotalChiffreAffaires();

    // Chiffre d'affaires sur une période
    @Query("SELECT SUM(c.total) FROM Commande c WHERE c.status <> 'annulee' AND c.dateCreation BETWEEN :debut AND :fin")
    BigDecimal calculateChiffreAffairesEntre(@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    // Nombre total de commandes (hors annulées)
    @Query("SELECT COUNT(c) FROM Commande c WHERE c.status <> 'annulee'")
    Long countCommandesValides();

    //commandes valide dans un intervalle
    @Query("""
    SELECT COUNT(c)
    FROM Commande c
    WHERE c.status <> 'annulee'
    AND c.dateCreation BETWEEN :debut AND :fin
    """)
    Long countCommandesValidesEntre(
            @Param("debut") LocalDateTime debut,
            @Param("fin") LocalDateTime fin
    );

    // Top des produits vendus
    @Query("SELECT cm.produit.id, cm.produit.nom, SUM(cm.quantite), SUM(cm.quantite * cm.prix) " +
        "FROM CommandeMenu cm WHERE cm.commande.status <> 'annulee' " +
        "GROUP BY cm.produit.id, cm.produit.nom " +
        "ORDER BY SUM(cm.quantite) DESC")
    List<Object[]> findTopProduitsVendus();
}