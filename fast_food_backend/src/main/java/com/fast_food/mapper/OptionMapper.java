package com.fast_food.mapper;

import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

import com.fast_food.dto.OptionGroupeResponse;
import com.fast_food.dto.OptionItemResponse;
import com.fast_food.entite.OptionGroupe;
import com.fast_food.entite.OptionItem;

@Component
public class OptionMapper {

    public OptionItemResponse toItemResponse(OptionItem item) {
        if (item == null) return null;

        OptionItemResponse dto = new OptionItemResponse();
        dto.setId(item.getId());
        dto.setNom(item.getNom());
        dto.setSurcout(item.getSurcout());
        if (item.getMatierePremiere() != null) {
            dto.setIdMatiere(item.getMatierePremiere().getId());
        }
        return dto;
    }

    public OptionGroupeResponse toGroupeResponse(OptionGroupe groupe) {
        if (groupe == null) return null;

        OptionGroupeResponse dto = new OptionGroupeResponse();
        dto.setId(groupe.getId());
        dto.setNom(groupe.getNom());
        dto.setMinSelection(groupe.getMinSelection());
        dto.setMaxSelection(groupe.getMaxSelection());

        if (groupe.getOptions() != null) {
            dto.setOptions(
                groupe.getOptions().stream()
                      .map(this::toItemResponse)
                      .collect(Collectors.toList())
            );
        }
        return dto;
    }
}