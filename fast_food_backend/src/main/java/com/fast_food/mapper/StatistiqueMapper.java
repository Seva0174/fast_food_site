package com.fast_food.mapper;

import com.fast_food.dto.StatistiquesGlobalesResponse;
import com.fast_food.dto.VenteProduitStatResponse;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

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
        Long nbCommandes = totalCommandes != null ? totalCommandes : 0L;
        BigDecimal benefice = caVal.subtract(approVal.add(salairesVal));

        // Calcul du panier moyen (CA / Nombre de commandes)
        BigDecimal panierMoyen = BigDecimal.ZERO;
        if (nbCommandes > 0) {
            panierMoyen = caVal.divide(BigDecimal.valueOf(nbCommandes), 2, RoundingMode.HALF_UP);
        }

        return StatistiquesGlobalesResponse.builder()
                .chiffreAffairesTotal(caVal)
                .depensesApprovisionnement(approVal)
                .masseSalariale(salairesVal)
                .beneficeEstime(benefice)
                .nombreCommandesTotal(nbCommandes)
                .panierMoyen(panierMoyen)
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