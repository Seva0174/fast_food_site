package com.fast_food.mapper;

import com.fast_food.dto.StatistiquesGlobalesResponse;
import com.fast_food.dto.VenteProduitStatResponse;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class StatistiqueMapper {

    public StatistiquesGlobalesResponse toGlobalesResponse(
            BigDecimal ca, 
            BigDecimal depensesAppro, 
            BigDecimal masseSalariale, 
            Long totalCommandes) {

        BigDecimal caVal = ca != null ? ca : BigDecimal.ZERO;
        BigDecimal approVal = depensesAppro != null ? depensesAppro : BigDecimal.ZERO;
        BigDecimal salairesVal = masseSalariale != null ? masseSalariale : BigDecimal.ZERO;
        BigDecimal benefice = caVal.subtract(approVal.add(salairesVal));

        return StatistiquesGlobalesResponse.builder()
                .chiffreAffairesTotal(caVal)
                .depensesApprovisionnement(approVal)
                .masseSalariale(salairesVal)
                .beneficeEstime(benefice)
                .nombreCommandesTotal(totalCommandes != null ? totalCommandes : 0L)
                .build();
    }

    public VenteProduitStatResponse toVenteProduitResponse(
            Long produitId, 
            String produitNom, 
            Long quantite, 
            BigDecimal totalGenere) {

        return VenteProduitStatResponse.builder()
                .produitId(produitId)
                .produitNom(produitNom)
                .quantiteVendue(quantite != null ? quantite : 0L)
                .totalGenere(totalGenere != null ? totalGenere : BigDecimal.ZERO)
                .build();
    }
}