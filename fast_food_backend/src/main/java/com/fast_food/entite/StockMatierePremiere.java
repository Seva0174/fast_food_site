package com.fast_food.entite;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class StockMatierePremiere {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "matierePremiere")
    @JsonIgnore // Empêche de sérialiser les recettes en boucle lors du chargement des matières premières
    private List<Recette> recettes;

    private String nom;
    private BigDecimal quantite;

    @Column(name = "unite_mesure")
    private String uniteMesure = "unite";
}
