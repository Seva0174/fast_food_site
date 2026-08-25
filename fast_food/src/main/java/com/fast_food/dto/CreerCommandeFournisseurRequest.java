package com.fast_food.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class CreerCommandeFournisseurRequest {
    @NotNull
    private Long idFournisseur;
    
    @NotEmpty
    private List<CommandeFournisseurItemRequest> items;
}