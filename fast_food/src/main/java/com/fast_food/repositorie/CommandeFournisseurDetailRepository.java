package com.fast_food.repositorie;

import com.fast_food.entite.CommandeFournisseurDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommandeFournisseurDetailRepository extends JpaRepository<CommandeFournisseurDetail, Long> {
    List<CommandeFournisseurDetail> findByCommandeFournisseurId(Long idCommande);
}