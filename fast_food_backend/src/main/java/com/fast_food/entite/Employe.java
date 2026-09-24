package com.fast_food.entite;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Getter
@Setter
@Table(name = "employe")
public class Employe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "id_user", nullable = false, unique = true)
    private User user;

    private String nom;

    public enum Role {
        CUISINIER,
        CAISSIER,
        MANAGER
    }

    @Enumerated(EnumType.STRING)
    private Role role; // Poste RH au sein du restaurant

    private BigDecimal salaire_heure;
}