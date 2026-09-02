package com.fast_food.entite;

import java.math.BigDecimal;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
    
    public enum Role {
        CUISINIER,
        MANAGER,
        CAISIER
    }
    @Enumerated(EnumType.STRING)
    private Role role;
    
    private String nom;
    private BigDecimal salaire_heure;
}
