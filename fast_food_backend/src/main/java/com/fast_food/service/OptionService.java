package com.fast_food.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fast_food.dto.OptionGroupeRequest;
import com.fast_food.dto.OptionGroupeResponse;
import com.fast_food.dto.OptionItemRequest;
import com.fast_food.dto.OptionItemResponse;
import com.fast_food.entite.OptionGroupe;
import com.fast_food.entite.OptionItem;
import com.fast_food.entite.ProduitMenu;
import com.fast_food.entite.StockMatierePremiere;
import com.fast_food.exception.ResourceNotFoundException;
import com.fast_food.mapper.OptionMapper;
import com.fast_food.repositorie.OptionGroupeRepository;
import com.fast_food.repositorie.OptionItemRepository;
import com.fast_food.repositorie.ProduitMenuRepository;
import com.fast_food.repositorie.StockMatierePremiereRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OptionService {

    private final OptionGroupeRepository optionGroupeRepository;
    private final OptionItemRepository optionItemRepository;
    private final ProduitMenuRepository produitMenuRepository;
    private final StockMatierePremiereRepository stockMatierePremiereRepository;
    private final OptionMapper optionMapper;

    @Transactional(readOnly = true)
    public List<OptionGroupeResponse> getGroupesByProduit(Long produitId) {
        ProduitMenu produit = produitMenuRepository.findById(produitId)
                .orElseThrow(() -> new ResourceNotFoundException("Produit non trouvé avec l'id : " + produitId));
        return optionGroupeRepository.findByProduitMenu(produit).stream()
                .map(optionMapper::toGroupeResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OptionGroupeResponse createGroupe(Long produitId, OptionGroupeRequest request) {
        ProduitMenu produit = produitMenuRepository.findById(produitId)
                .orElseThrow(() -> new ResourceNotFoundException("Produit non trouvé avec l'id : " + produitId));

        OptionGroupe groupe = new OptionGroupe();
        groupe.setNom(request.getNom());
        groupe.setMinSelection(request.getMinSelection());
        groupe.setMaxSelection(request.getMaxSelection());
        groupe.setProduitMenu(produit);

        return optionMapper.toGroupeResponse(optionGroupeRepository.save(groupe));
    }

    @Transactional
    public OptionGroupeResponse updateGroupe(Long groupeId, OptionGroupeRequest request) {
        OptionGroupe groupe = optionGroupeRepository.findById(groupeId)
                .orElseThrow(() -> new ResourceNotFoundException("Groupe d'option non trouvé avec l'id : " + groupeId));

        groupe.setNom(request.getNom());
        groupe.setMinSelection(request.getMinSelection());
        groupe.setMaxSelection(request.getMaxSelection());

        return optionMapper.toGroupeResponse(optionGroupeRepository.save(groupe));
    }

    @Transactional
    public void deleteGroupe(Long groupeId) {
        if (!optionGroupeRepository.existsById(groupeId)) {
            throw new ResourceNotFoundException("Groupe d'option non trouvé avec l'id : " + groupeId);
        }
        optionGroupeRepository.deleteById(groupeId);
    }

    @Transactional
    public OptionItemResponse createItem(Long groupeId, OptionItemRequest request) {
        // On priorise l'ID du groupe envoyé dans le DTO s'il existe, sinon celui du PATH
        Long targetGroupeId = (request.getGroupeId() != null) ? request.getGroupeId() : groupeId;

        OptionGroupe groupe = optionGroupeRepository.findById(targetGroupeId)
                .orElseThrow(() -> new ResourceNotFoundException("Groupe d'option non trouvé avec l'id : " + targetGroupeId));

        OptionItem item = new OptionItem();
        item.setNom(request.getNom());
        item.setSurcout(request.getSurcout());
        item.setGroupe(groupe);

        if (request.getMatierePremiereId() != null) {
            StockMatierePremiere mp = stockMatierePremiereRepository.findById(request.getMatierePremiereId())
                    .orElseThrow(() -> new ResourceNotFoundException("Matière première non trouvée : " + request.getMatierePremiereId()));
            item.setMatierePremiere(mp);
            item.setQuantiteDeduite(request.getQuantiteDeduite());
        }

        return optionMapper.toItemResponse(optionItemRepository.save(item));
    }

    @Transactional
    public OptionItemResponse updateItem(Long itemId, OptionItemRequest request) {
        OptionItem item = optionItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Option non trouvée avec l'id : " + itemId));

        item.setNom(request.getNom());
        item.setSurcout(request.getSurcout());

        // Si groupeId est renseigné dans le DTO de mise à jour, on réaffecte le groupe
        if (request.getGroupeId() != null) {
            OptionGroupe groupe = optionGroupeRepository.findById(request.getGroupeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Groupe d'option non trouvé avec l'id : " + request.getGroupeId()));
            item.setGroupe(groupe);
        }

        if (request.getMatierePremiereId() != null) {
            StockMatierePremiere mp = stockMatierePremiereRepository.findById(request.getMatierePremiereId())
                    .orElseThrow(() -> new ResourceNotFoundException("Matière première non trouvée : " + request.getMatierePremiereId()));
            item.setMatierePremiere(mp);
            item.setQuantiteDeduite(request.getQuantiteDeduite());
        } else {
            item.setMatierePremiere(null);
            item.setQuantiteDeduite(null);
        }

        return optionMapper.toItemResponse(optionItemRepository.save(item));
    }

    @Transactional
    public void deleteItem(Long itemId) {
        if (!optionItemRepository.existsById(itemId)) {
            throw new ResourceNotFoundException("Option non trouvée avec l'id : " + itemId);
        }
        optionItemRepository.deleteById(itemId);
    }
}