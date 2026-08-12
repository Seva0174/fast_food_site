package com.fast_food.entite;

import java.math.BigDecimal;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "commandes_fournisseurs_details")
public class CommandeFournisseurDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_commande_fournisseur")
    private CommandeFournisseur commandeFournisseur;

    @ManyToOne
    @JoinColumn(name = "id_stock")
    private StockMatierePremiere stock;

    private BigDecimal quantite;
    private float prixUnitaire;
}
