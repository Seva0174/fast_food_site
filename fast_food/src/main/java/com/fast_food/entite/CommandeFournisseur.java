package com.fast_food.entite;


import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "commandes_fournisseurs")
public class CommandeFournisseur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name ="id_fournisseur")
    private Fournisseur fournisseur;
 
    private LocalDate dateCommande;
    private LocalDate dateReception;
    private enum Status{
        RECUE,
        EXPEDIEE,
        EN_ATTENTE,
        ANNULEE
    }
    @Enumerated(EnumType.STRING)
    private Status status; 
}
