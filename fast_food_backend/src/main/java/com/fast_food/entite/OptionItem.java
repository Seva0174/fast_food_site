package com.fast_food.entite;

import java.math.BigDecimal;

import jakarta.persistence.Column;
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
@Table(name = "option_item")
public class OptionItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_groupe")
    private OptionGroupe groupe;

    @ManyToOne
    @JoinColumn(name = "id_matiere")
    private StockMatierePremiere matierePremiere;

    private String nom;

    @Column(name = "quantite_deduite")
    private BigDecimal quantiteDeduite = BigDecimal.ONE;

    private BigDecimal surcout = BigDecimal.ZERO;
}