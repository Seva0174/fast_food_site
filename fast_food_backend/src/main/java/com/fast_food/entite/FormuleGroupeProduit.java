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

/**
 * Produit propose dans un emplacement de formule, avec son surcout eventuel.
 */
@Entity
@Getter
@Setter
@Table(name = "formule_groupe_produit")
public class FormuleGroupeProduit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_groupe")
    private FormuleGroupe groupe;

    @ManyToOne
    @JoinColumn(name = "id_produit")
    private ProduitMenu produit;

    private BigDecimal surcout = BigDecimal.ZERO;
}