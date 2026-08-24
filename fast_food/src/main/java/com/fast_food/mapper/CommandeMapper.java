package com.fast_food.mapper;

import com.fast_food.dto.CommandeItemResponse;
import com.fast_food.dto.CommandeResponse;
import com.fast_food.entite.Commande;
import com.fast_food.entite.CommandeMenu;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
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

        return response;
    }

    public CommandeResponse toResponse(Commande commande) {
        if (commande == null) {
            return null;
        }

        CommandeResponse response = new CommandeResponse();
        response.setId(commande.getId());
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