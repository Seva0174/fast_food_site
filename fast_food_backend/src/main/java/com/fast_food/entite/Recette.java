package com.fast_food.entite;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Recette {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "id_matiere")
    @JsonIgnoreProperties("recettes") // Coupe la boucle d'aller-retour
    private StockMatierePremiere matierePremiere;

    @ManyToOne
    @JoinColumn(name = "id_produit")
    private ProduitMenu produitMenu;

    private BigDecimal quantiteRequise;
}
