package com.fast_food.entite;

import java.time.LocalDateTime;
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
@Setter
@Getter
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
    private Status status;

    private String cpRue;
    private String cpVille;
    private String cpCodePostal;

    private float total;
    private LocalDateTime dateCreation;

}
