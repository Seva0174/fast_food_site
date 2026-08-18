package com.fast_food.entite;

import java.math.BigDecimal;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class ProduitMenu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "produitMenu")
    private List<Recette> recette;

    @ManyToOne
    @JoinColumn(name = "id_categorie")
    private Categorie categorie;

    private String description;
    private BigDecimal prix;
    private String imageUrl;
    private String nom;
    private boolean estDispo;
    
}
