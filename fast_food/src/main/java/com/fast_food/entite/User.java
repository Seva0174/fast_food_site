package com.fast_food.entite;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "user")
    private List<Commande> commandes;

    @OneToOne(mappedBy = "user")
    private Adresse adresse;

    @OneToOne(mappedBy = "user")
    private EmailVerificationToken emailToken;
    
    @OneToMany(mappedBy = "user")
    private List<Panier> panier;

    private String email;
    private String mdp;
    private String nom;
    private LocalDate dateCreation;
    private boolean estVerif;
    private enum Role{
        ADMIN,
        CLIENT,
        EMPLOYE
    }
    private Role role;
}
