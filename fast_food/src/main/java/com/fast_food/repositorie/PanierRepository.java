package com.fast_food.repositorie;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fast_food.entite.Panier;

@Repository
public interface PanierRepository extends JpaRepository<Panier,Long>{
    
}
