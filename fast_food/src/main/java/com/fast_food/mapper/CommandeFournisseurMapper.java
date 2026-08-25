package com.fast_food.mapper;

import com.fast_food.dto.CommandeFournisseurItemResponse;
import com.fast_food.dto.CommandeFournisseurResponse;
import com.fast_food.entite.CommandeFournisseur;
import com.fast_food.entite.CommandeFournisseurDetail;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class CommandeFournisseurMapper {

    public CommandeFournisseurResponse toResponse(CommandeFournisseur entity, List<CommandeFournisseurDetail> details) {
        CommandeFournisseurResponse dto = new CommandeFournisseurResponse();
        dto.setId(entity.getId());
        
        if (entity.getFournisseur() != null) {
            dto.setIdFournisseur(entity.getFournisseur().getId());
            dto.setFournisseurNom(entity.getFournisseur().getNom());
        }
        
        dto.setDateCommande(entity.getDateCommande());
        dto.setDateReception(entity.getDateReception());
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);

        BigDecimal montantTotal = BigDecimal.ZERO;
        if (details != null) {
            List<CommandeFournisseurItemResponse> items = details.stream()
                    .map(this::toItemResponse)
                    .toList();
            
            for (CommandeFournisseurItemResponse item : items) {
                montantTotal = montantTotal.add(item.getTotalLigne());
            }
            
            dto.setDetails(items);
        }
        
        dto.setMontantTotal(montantTotal);
        return dto;
    }

    public CommandeFournisseurItemResponse toItemResponse(CommandeFournisseurDetail detail) {
        CommandeFournisseurItemResponse dto = new CommandeFournisseurItemResponse();
        dto.setId(detail.getId());
        
        if (detail.getStock() != null) {
            dto.setIdStock(detail.getStock().getId());
            dto.setMatierePremiereNom(detail.getStock().getNom());
        }
        
        dto.setQuantite(detail.getQuantite());
        dto.setPrixUnitaire(detail.getPrixUnitaire());
        
        if (detail.getPrixUnitaire() != null && detail.getQuantite() != null) {
            dto.setTotalLigne(detail.getPrixUnitaire().multiply(detail.getQuantite()));
        } else {
            dto.setTotalLigne(BigDecimal.ZERO);
        }
        
        return dto;
    }
}