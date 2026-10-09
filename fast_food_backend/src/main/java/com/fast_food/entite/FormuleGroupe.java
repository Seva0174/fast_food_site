package com.fast_food.entite;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;


@Entity
@Getter
@Setter
@Table(name = "formule_groupe")
public class FormuleGroupe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_formule")
    private ProduitMenu formule;

    private String nom;
    private int minSelection;
    private int maxSelection;
    private int ordre;

    @OneToMany(mappedBy = "groupe", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<FormuleGroupeProduit> produits = new ArrayList<>();

    /**
     * Surcout applique quand le produit donne est choisi dans cet emplacement.
     * Retourne zero si le produit n'est pas propose dans l'emplacement.
     */
    public BigDecimal surcoutPour(ProduitMenu produit) {
        if (produits == null || produit == null) {
            return BigDecimal.ZERO;
        }
        return produits.stream()
                .filter(lien -> lien.getProduit() != null && lien.getProduit().getId().equals(produit.getId()))
                .map(FormuleGroupeProduit::getSurcout)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(BigDecimal.ZERO);
    }
}