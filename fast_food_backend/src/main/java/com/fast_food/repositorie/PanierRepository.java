package com.fast_food.repositorie;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fast_food.entite.Panier;
import com.fast_food.entite.User;

@Repository
public interface PanierRepository extends JpaRepository<Panier,Long>{
    Optional<Panier> findByUser(User user);
}
