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

    /**
     * Ligne de commande.
     * Pour une formule, le prix unitaire retourne est le prix de base + les supplements de tous
     * les composants, et le sous-total est calcule sur ce prix complet.
     * Pour un composant, le prix retourne est uniquement son supplement.
     */
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

        if (item.getFormuleGroupe() != null) {
            response.setNomGroupe(item.getFormuleGroupe().getNom());
        }

        response.setQuantite(item.getQuantite());

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

        // Mapping des composants (formule)
        BigDecimal prixUnitaire = item.getPrix();
        List<CommandeItemResponse> composants = new ArrayList<>();
        if (item.getComposants() != null) {
            for (CommandeMenu enfant : item.getComposants()) {
                composants.add(toItemResponse(enfant));
                if (prixUnitaire != null && enfant.getPrix() != null) {
                    prixUnitaire = prixUnitaire.add(enfant.getPrix());
                }
            }
        }
        response.setComposants(composants);

        response.setPrix(prixUnitaire);
        if (prixUnitaire != null) {
            response.setSousTotal(prixUnitaire.multiply(BigDecimal.valueOf(item.getQuantite())));
        }

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

        // Seules les lignes principales sont listees : les composants d'une formule
        // sont retournes dans la liste "composants" de leur ligne parent.
        List<CommandeItemResponse> itemsResponse = (commande.getCommandeProduits() == null)
                ? Collections.emptyList()
                : commande.getCommandeProduits().stream()
                        .filter(ligne -> ligne.getParent() == null)
                        .map(this::toItemResponse)
                        .collect(Collectors.toList());

        response.setItems(itemsResponse);

        return response;
    }
}