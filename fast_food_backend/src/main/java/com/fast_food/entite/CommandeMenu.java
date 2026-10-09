package com.fast_food.entite;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

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

/**
 * Ligne d'une commande.
 *
 * Pour une formule, la ligne principale porte le prix de base de la formule
 * et chaque produit choisi est une ligne enfant (parent renseigne) dont le prix
 * est uniquement le supplement (surcout de l'emplacement + surcouts des options).
 * La quantite d'une ligne enfant est egale a celle de sa ligne parent.
 * Toutes les lignes (principales et enfants) sont rattachees a la commande.
 */
@Entity
@Getter
@Setter
@Table(name = "commandes_menu")
public class CommandeMenu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name ="id_produit")
    private ProduitMenu produitMenu;

    @ManyToOne
    @JoinColumn(name = "id_commande")
    private Commande commandeInfo;

    @OneToMany(mappedBy = "commandeMenu", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommandeItemOption> options = new ArrayList<>();

    // Ligne de la formule dont celle-ci est un composant (null pour une ligne principale)
    @ManyToOne
    @JoinColumn(name = "id_item_parent")
    private CommandeMenu parent;

    // Lignes enfants (persistees via la liste des lignes de la commande, donc sans cascade ici)
    @OneToMany(mappedBy = "parent")
    @OrderBy("id ASC")
    private List<CommandeMenu> composants = new ArrayList<>();

    // Emplacement de la formule dans lequel le produit a ete choisi
    @ManyToOne
    @JoinColumn(name = "id_formule_groupe")
    private FormuleGroupe formuleGroupe;

    private int quantite;
    private BigDecimal prix;
}