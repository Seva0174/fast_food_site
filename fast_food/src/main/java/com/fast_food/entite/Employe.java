package com.fast_food.entite;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;

@Entity
@Setter
@Getter
public class Employe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)    
    private Long id;
    
    @OneToMany(mappedBy = "employe")
    private List<EmployeHeure> heures;
    
    private enum Role {
        CUISINIER,
        MANAGER,
        CAISIER
    }
    private Role role;
    
    private String nom;
    private float salaire_heure;
}
