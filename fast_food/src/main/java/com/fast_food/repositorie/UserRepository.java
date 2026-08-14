package com.fast_food.repositorie;

import org.springframework.stereotype.Repository;

import com.fast_food.entite.User;

import org.springframework.data.jpa.repository.JpaRepository;


@Repository
public interface UserRepository extends JpaRepository<User,Long>{
    
}
