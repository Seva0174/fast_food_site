package com.fast_food.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fast_food.dto.FormuleGroupeProduitRequest;
import com.fast_food.dto.FormuleGroupeRequest;
import com.fast_food.dto.FormuleGroupeResponse;
import com.fast_food.entite.FormuleGroupe;
import com.fast_food.entite.FormuleGroupeProduit;
import com.fast_food.entite.ProduitMenu;
import com.fast_food.exception.ResourceNotFoundException;
import com.fast_food.mapper.FormuleMapper;
import com.fast_food.repositorie.FormuleGroupeProduitRepository;
import com.fast_food.repositorie.FormuleGroupeRepository;
import com.fast_food.repositorie.ProduitMenuRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FormuleService {

    private final ProduitMenuRepository produitMenuRepository;
    private final FormuleGroupeRepository formuleGroupeRepository;
    private final FormuleGroupeProduitRepository formuleGroupeProduitRepository;
    private final FormuleMapper formuleMapper;

    @Transactional(readOnly = true)
    public List<FormuleGroupeResponse> getGroupesByFormule(Long idFormule) {
        trouverFormule(idFormule);
        return formuleGroupeRepository.findByFormuleIdOrderByOrdreAscIdAsc(idFormule).stream()
                .map(formuleMapper::toGroupeResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public FormuleGroupeResponse creerGroupe(Long idFormule, FormuleGroupeRequest request) {
        ProduitMenu formule = trouverFormule(idFormule);
        int[] regles = validerRegles(request);

        FormuleGroupe groupe = new FormuleGroupe();
        groupe.setFormule(formule);
        groupe.setNom(request.getNom().trim());
        groupe.setMinSelection(regles[0]);
        groupe.setMaxSelection(regles[1]);
        groupe.setOrdre(request.getOrdre() != null ? request.getOrdre() : formule.getGroupesFormule().size() + 1);

        return formuleMapper.toGroupeResponse(formuleGroupeRepository.save(groupe));
    }

    @Transactional
    public FormuleGroupeResponse modifierGroupe(Long idGroupe, FormuleGroupeRequest request) {
        FormuleGroupe groupe = trouverGroupe(idGroupe);
        int[] regles = validerRegles(request);

        groupe.setNom(request.getNom().trim());
        groupe.setMinSelection(regles[0]);
        groupe.setMaxSelection(regles[1]);
        if (request.getOrdre() != null) {
            groupe.setOrdre(request.getOrdre());
        }

        return formuleMapper.toGroupeResponse(formuleGroupeRepository.save(groupe));
    }

    @Transactional
    public void supprimerGroupe(Long idGroupe) {
        FormuleGroupe groupe = trouverGroupe(idGroupe);
        formuleGroupeRepository.delete(groupe);
    }

    @Transactional
    public FormuleGroupeResponse ajouterProduit(Long idGroupe, FormuleGroupeProduitRequest request) {
        FormuleGroupe groupe = trouverGroupe(idGroupe);

        if (request.getIdProduit() == null) {
            throw new IllegalArgumentException("Le produit à ajouter est obligatoire.");
        }

        ProduitMenu produit = produitMenuRepository.findById(request.getIdProduit())
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable avec l'ID : " + request.getIdProduit()));

        if (produit.isEstFormule()) {
            throw new IllegalArgumentException("Une formule ne peut pas être proposée à l'intérieur d'une autre formule.");
        }
        if (formuleGroupeProduitRepository.existsByGroupeIdAndProduitId(idGroupe, produit.getId())) {
            throw new IllegalArgumentException("Le produit '" + produit.getNom() + "' est déjà proposé dans cet emplacement.");
        }

        FormuleGroupeProduit lien = new FormuleGroupeProduit();
        lien.setGroupe(groupe);
        lien.setProduit(produit);
        lien.setSurcout(validerSurcout(request.getSurcout()));

        formuleGroupeProduitRepository.save(lien);
        groupe.getProduits().add(lien);

        return formuleMapper.toGroupeResponse(groupe);
    }

    @Transactional
    public FormuleGroupeResponse modifierSurcout(Long idLien, FormuleGroupeProduitRequest request) {
        FormuleGroupeProduit lien = trouverLien(idLien);
        lien.setSurcout(validerSurcout(request.getSurcout()));
        formuleGroupeProduitRepository.save(lien);

        return formuleMapper.toGroupeResponse(lien.getGroupe());
    }

    @Transactional
    public FormuleGroupeResponse retirerProduit(Long idLien) {
        FormuleGroupeProduit lien = trouverLien(idLien);
        FormuleGroupe groupe = lien.getGroupe();

        // La suppression du lien est effectuée par orphanRemoval
        groupe.getProduits().remove(lien);
        formuleGroupeRepository.save(groupe);

        return formuleMapper.toGroupeResponse(groupe);
    }

    // ------------------------------------------------------------------
    // Utilitaires
    // ------------------------------------------------------------------

    private ProduitMenu trouverFormule(Long idFormule) {
        ProduitMenu formule = produitMenuRepository.findById(idFormule)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable avec l'ID : " + idFormule));
        if (!formule.isEstFormule()) {
            throw new IllegalArgumentException("Le produit '" + formule.getNom() + "' n'est pas une formule.");
        }
        return formule;
    }

    private FormuleGroupe trouverGroupe(Long idGroupe) {
        return formuleGroupeRepository.findById(idGroupe)
                .orElseThrow(() -> new ResourceNotFoundException("Emplacement de formule introuvable avec l'ID : " + idGroupe));
    }

    private FormuleGroupeProduit trouverLien(Long idLien) {
        return formuleGroupeProduitRepository.findById(idLien)
                .orElseThrow(() -> new ResourceNotFoundException("Produit d'emplacement introuvable avec l'ID : " + idLien));
    }

    // Retourne { minSelection, maxSelection } après validation
    private int[] validerRegles(FormuleGroupeRequest request) {
        if (request.getNom() == null || request.getNom().isBlank()) {
            throw new IllegalArgumentException("Le nom de l'emplacement est obligatoire.");
        }

        int min = request.getMinSelection() != null ? request.getMinSelection() : 1;
        int max = request.getMaxSelection() != null ? request.getMaxSelection() : 1;

        if (min < 0) {
            throw new IllegalArgumentException("Le minimum de choix ne peut pas être négatif.");
        }
        if (max < 1) {
            throw new IllegalArgumentException("Le maximum de choix doit être d'au moins 1.");
        }
        if (max < min) {
            throw new IllegalArgumentException("Le maximum de choix ne peut pas être inférieur au minimum.");
        }
        return new int[] { min, max };
    }

    private BigDecimal validerSurcout(BigDecimal surcout) {
        if (surcout == null) {
            return BigDecimal.ZERO;
        }
        if (surcout.signum() < 0) {
            throw new IllegalArgumentException("Le surcoût ne peut pas être négatif.");
        }
        return surcout;
    }
}