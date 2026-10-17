package com.fast_food.repositorie;

import com.fast_food.entite.Commande;
import com.fast_food.entite.CommandeMenu;
import com.fast_food.entite.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CommandeRepository extends JpaRepository<Commande, Long> {

    @Query("SELECT DISTINCT c FROM Commande c LEFT JOIN FETCH c.user LEFT JOIN FETCH c.commandeProduits cp LEFT JOIN FETCH cp.produitMenu WHERE c.user = :user ORDER BY c.dateCreation DESC")
    List<Commande> findByUserOrderByDateCreationDesc(@Param("user") User user);

    @Query("SELECT DISTINCT c FROM Commande c LEFT JOIN FETCH c.user LEFT JOIN FETCH c.commandeProduits cp LEFT JOIN FETCH cp.produitMenu ORDER BY c.dateCreation DESC")
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

    // Top des produits vendus (global).
    // Un menu compte comme une vente du menu : ses composants (lignes enfants) ne sont pas comptés seuls.
    @Query(value = """
            SELECT p.id_produit,
                   pm.nom,
                   SUM(p.quantite) AS quantite_vendue,
                   SUM(p.quantite * p.prix + COALESCE(s.supplement, 0)) AS total_genere
            FROM commandes_menu p
            JOIN commandes c ON c.id = p.id_commande
            JOIN produit_menu pm ON pm.id = p.id_produit
            LEFT JOIN (
                SELECT id_item_parent, SUM(quantite * prix) AS supplement
                FROM commandes_menu
                WHERE id_item_parent IS NOT NULL
                GROUP BY id_item_parent
            ) s ON s.id_item_parent = p.id
            WHERE p.id_item_parent IS NULL
              AND c.status <> 'annulee'
            GROUP BY p.id_produit, pm.nom
            ORDER BY quantite_vendue DESC
            """, nativeQuery = true)
    List<Object[]> findTopProduitsVendus();

    // Top des produits vendus sur une période (mêmes règles que la vue globale)
    @Query(value = """
            SELECT p.id_produit,
                   pm.nom,
                   SUM(p.quantite) AS quantite_vendue,
                   SUM(p.quantite * p.prix + COALESCE(s.supplement, 0)) AS total_genere
            FROM commandes_menu p
            JOIN commandes c ON c.id = p.id_commande
            JOIN produit_menu pm ON pm.id = p.id_produit
            LEFT JOIN (
                SELECT id_item_parent, SUM(quantite * prix) AS supplement
                FROM commandes_menu
                WHERE id_item_parent IS NOT NULL
                GROUP BY id_item_parent
            ) s ON s.id_item_parent = p.id
            WHERE p.id_item_parent IS NULL
              AND c.status <> 'annulee'
              AND c.date_creation BETWEEN :debut AND :fin
            GROUP BY p.id_produit, pm.nom
            ORDER BY quantite_vendue DESC
            """, nativeQuery = true)
    List<Object[]> findTopProduitsVendusEntre(@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    // Nombre de commandes par jour de la semaine (ISODOW : 1 = lundi, 7 = dimanche)
    @Query(value = "SELECT CAST(EXTRACT(ISODOW FROM date_creation) AS INTEGER) AS jour_num, " +
            "COUNT(id) AS total " +
            "FROM commandes " +
            "WHERE status != 'annulee' " +
            "GROUP BY jour_num ORDER BY jour_num", nativeQuery = true)
    List<Object[]> countCommandesParJourSemaine();

    // Nombre de commandes par jour de la semaine sur une période
    @Query(value = "SELECT CAST(EXTRACT(ISODOW FROM date_creation) AS INTEGER) AS jour_num, " +
            "COUNT(id) AS total " +
            "FROM commandes " +
            "WHERE status != 'annulee' AND date_creation BETWEEN :debut AND :fin " +
            "GROUP BY jour_num ORDER BY jour_num", nativeQuery = true)
    List<Object[]> countCommandesParJourSemaineEntre(@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    // Charge les options de toutes les lignes (principales et composants) des commandes donnees
    @Query("SELECT DISTINCT cm FROM CommandeMenu cm LEFT JOIN FETCH cm.options WHERE cm.commandeInfo IN :commandes")
    List<CommandeMenu> chargerOptionsDesLignes(@Param("commandes") List<Commande> commandes);

    // Charge les composants des lignes de menu (les entites sont deja en cache de session)
    @Query("SELECT DISTINCT cm FROM CommandeMenu cm LEFT JOIN FETCH cm.composants WHERE cm.commandeInfo IN :commandes")
    List<CommandeMenu> chargerComposantsDesLignes(@Param("commandes") List<Commande> commandes);
}