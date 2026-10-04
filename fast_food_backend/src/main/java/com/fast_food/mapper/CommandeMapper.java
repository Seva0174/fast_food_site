package com.fast_food.mapper;

import com.fast_food.dto.CommandeItemOptionResponse;
import com.fast_food.dto.CommandeItemResponse;
import com.fast_food.dto.CommandeResponse;
import com.fast_food.entite.Commande;
import com.fast_food.entite.CommandeItemOption;
import com.fast_food.entite.CommandeMenu;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CommandeMapper {

    public CommandeItemResponse toItemResponse(CommandeMenu item) {
        if (item == null) {
            return null;
        }

        CommandeItemResponse response = new CommandeItemResponse();
        response.setId(item.getId());
        
        if (item.getProduitMenu() != null) {
            response.setProduitId(item.getProduitMenu().getId());
            response.setNomProduit(item.getProduitMenu().getNom());
        }

        response.setQuantite(item.getQuantite());
        response.setPrix(item.getPrix());

        if (item.getPrix() != null) {
            response.setSousTotal(item.getPrix().multiply(BigDecimal.valueOf(item.getQuantite())));
        }

        // Mapping des options
        List<CommandeItemOptionResponse> optionResponses = new ArrayList<>();
        if (item.getOptions() != null) {
            for (CommandeItemOption cio : item.getOptions()) {
                CommandeItemOptionResponse optDto = new CommandeItemOptionResponse();
                optDto.setNomOption(cio.getNomOption());
                optDto.setSurcoutHistorise(cio.getSurcout());
                optionResponses.add(optDto);
            }
        }
        response.setOptions(optionResponses);

        return response;
    }

    public CommandeResponse toResponse(Commande commande) {
        if (commande == null) {
            return null;
        }

        CommandeResponse response = new CommandeResponse();
        response.setId(commande.getId());

        if (commande.getUser() != null) {
            response.setNomClient(commande.getUser().getNom());
        }
        
        if (commande.getTypeRetrait() != null) {
            response.setTypeRetrait(commande.getTypeRetrait().name());
        }
        
        if (commande.getStatus() != null) {
            response.setStatus(commande.getStatus().name());
        }
        
        response.setCpRue(commande.getCpRue());
        response.setCpVille(commande.getCpVille());
        response.setCpCodePostal(commande.getCpCodePostal());
        response.setTotal(commande.getTotal());
        response.setDateCreation(commande.getDateCreation());

        List<CommandeItemResponse> itemsResponse = (commande.getCommandeProduits() == null)
                ? Collections.emptyList()
                : commande.getCommandeProduits().stream()
                        .map(this::toItemResponse)
                        .collect(Collectors.toList());

        response.setItems(itemsResponse);

        return response;
    }
}