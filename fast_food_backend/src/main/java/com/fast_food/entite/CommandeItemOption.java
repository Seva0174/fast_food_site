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
@Table(name = "commande_item_options")
public class CommandeItemOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_commande_menu")
    private CommandeMenu commandeMenu;

    @ManyToOne
    @JoinColumn(name = "id_option_item")
    private OptionItem optionItem;

    @Column(name = "nom_option")
    private String nomOption;

    private BigDecimal surcout = BigDecimal.ZERO;
}