package com.fast_food.entite;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "users")
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
    private LocalDateTime dateCreation;
    private boolean estVerif;
    public enum Role{
        admin,
        client,
        employe
    }
    @Enumerated(EnumType.STRING)
    private Role role;
}
