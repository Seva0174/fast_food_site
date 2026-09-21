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
public interface CommandeRepository extends JpaRepository<Commande, Long> {

    @Query("SELECT DISTINCT c FROM Commande c LEFT JOIN FETCH c.commandeProduits cp LEFT JOIN FETCH cp.produitMenu WHERE c.user = :user ORDER BY c.dateCreation DESC")
    List<Commande> findByUserOrderByDateCreationDesc(@Param("user") User user);

    @Query("SELECT DISTINCT c FROM Commande c LEFT JOIN FETCH c.commandeProduits cp LEFT JOIN FETCH cp.produitMenu ORDER BY c.dateCreation DESC")
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

    // Commandes valides dans un intervalle
    @Query("SELECT COUNT(c) FROM Commande c WHERE c.status <> 'annulee' AND c.dateCreation BETWEEN :debut AND :fin")
    Long countCommandesValidesEntre(@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    // Top des produits vendus
    @Query("SELECT cm.produitMenu.id, cm.produitMenu.nom, SUM(cm.quantite), SUM(cm.quantite * cm.prix) " +
           "FROM CommandeMenu cm WHERE cm.commandeInfo.status <> 'annulee' " +
           "GROUP BY cm.produitMenu.id, cm.produitMenu.nom " +
           "ORDER BY SUM(cm.quantite) DESC")
    List<Object[]> findTopProduitsVendus();

    //Recupre le nb de cmd pour tt les jours des la semaines
    @Query(value = "SELECT CAST(EXTRACT(ISODOW FROM date_creation) AS INTEGER) AS jour_num, " +
            "COUNT(id) AS total " +
            "FROM commandes " +
            "WHERE status != 'annulee' " +
            "GROUP BY jour_num ORDER BY jour_num", nativeQuery = true)
    List<Object[]> countCommandesParJourSemaine();
}