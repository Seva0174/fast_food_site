package com.fast_food.entite;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Setter
@Getter
@Table( name = "commandes")
public class Commande {
    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "commandeInfo")
    private List<CommandeMenu> commandeProduits;

    @ManyToOne
    @JoinColumn(name = "id_user")
    private User user;

    private enum Status{
        EN_ATTENTE,
        EN_PREPARATION,
        PRETE,
        LIVREE,
        ANNULEE
    }
    @Enumerated(EnumType.STRING)
    private Status status;

    private String cpRue;
    private String cpVille;
    private String cpCodePostal;

    private BigDecimal total;
    private LocalDateTime dateCreation;

}
