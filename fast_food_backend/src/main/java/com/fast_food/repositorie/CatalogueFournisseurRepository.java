package com.fast_food.repositorie;

import com.fast_food.entite.CatalogueFournisseur;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CatalogueFournisseurRepository extends JpaRepository<CatalogueFournisseur, Long> {
    List<CatalogueFournisseur> findByFournisseurId(Long idFournisseur);
}