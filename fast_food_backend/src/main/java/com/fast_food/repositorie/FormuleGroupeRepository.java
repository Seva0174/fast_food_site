package com.fast_food.repositorie;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fast_food.entite.FormuleGroupe;

public interface FormuleGroupeRepository extends JpaRepository<FormuleGroupe, Long> {

    List<FormuleGroupe> findByFormuleIdOrderByOrdreAscIdAsc(Long idFormule);
}