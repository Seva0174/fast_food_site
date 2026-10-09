package com.fast_food.repositorie;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fast_food.entite.FormuleGroupeProduit;

public interface FormuleGroupeProduitRepository extends JpaRepository<FormuleGroupeProduit, Long> {

    // Permet de securiser la suppression d'un produit utilise dans une formule
    boolean existsByProduitId(Long idProduit);

    boolean existsByGroupeIdAndProduitId(Long idGroupe, Long idProduit);
}