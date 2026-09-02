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
@Getter
@Setter
public class Fournisseur {
    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long id;
    private String nom;

    @OneToMany(mappedBy = "fournisseur")
    private List<CommandeFournisseur> commandes;

    @OneToMany(mappedBy = "fournisseur")
    private List<CatalogueFournisseur> catalogue;
}
