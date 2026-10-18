package com.fast_food.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class ProduitMenuRequest {
    @NotBlank(message = "Le nom du produit est obligatoire")
    private String nom;

    private String description;

    @NotNull(message = "Le prix est obligatoire")
    @PositiveOrZero(message = "Le prix ne peut pas être négatif")
    private BigDecimal prix;

    private String imageUrl;
    private Boolean estDispo;

    @NotNull(message = "La catégorie est obligatoire")
    private Long idCategorie;

    @Valid
    private List<RecetteItemRequest> recette;

    private Boolean estFormule;
}