package com.fast_food.service;

import com.fast_food.dto.AjouterProduitRequest;
import com.fast_food.dto.ModifierQuantiteRequest;
import com.fast_food.dto.PanierResponse;
import com.fast_food.entite.OptionGroupe;
import com.fast_food.entite.OptionItem;
import com.fast_food.entite.Panier;
import com.fast_food.entite.PanierItem;
import com.fast_food.entite.PanierItemOption;
import com.fast_food.entite.ProduitMenu;
import com.fast_food.entite.User;
import com.fast_food.exception.ResourceNotFoundException;
import com.fast_food.mapper.PanierMapper;
import com.fast_food.repositorie.OptionItemRepository;
import com.fast_food.repositorie.PanierRepository;
import com.fast_food.repositorie.ProduitMenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PanierService {

    private final PanierRepository panierRepository;
    private final ProduitMenuRepository produitMenuRepository;
    private final OptionItemRepository optionItemRepository;
    private final PanierMapper panierMapper;

    @Transactional
    public Panier getPanierEntityByUser(User user) {
        return panierRepository.findByUser(user)
                .orElseGet(() -> {
                    Panier nouveauPanier = new Panier();
                    nouveauPanier.setUser(user);
                    nouveauPanier.setPanierContenu(new ArrayList<>());
                    return panierRepository.save(nouveauPanier);
                });
    }

    @Transactional(readOnly = true)
    public PanierResponse getPanierByUser(User user) {
        Panier panier = panierRepository.findByUser(user)
                .orElseGet(() -> {
                    Panier p = new Panier();
                    p.setUser(user);
                    p.setPanierContenu(new ArrayList<>());
                    return p;
                });
        return panierMapper.toResponse(panier);
    }

    @Transactional
    public PanierResponse ajouterProduit(User user, AjouterProduitRequest request) {
        // 1. Récupération et contrôle du produit
        ProduitMenu produit = produitMenuRepository.findById(request.getProduitId())
                .orElseThrow(() -> new ResourceNotFoundException("Produit non trouvé avec l'id : " + request.getProduitId()));

        if (Boolean.FALSE.equals(produit.isEstDispo())) {
            throw new IllegalArgumentException("Ce produit n'est pas disponible actuellement.");
        }

        // 2. Charger et valider les options sélectionnées
        List<OptionItem> optionsSelectionnees = new ArrayList<>();
        if (request.getOptionIds() != null && !request.getOptionIds().isEmpty()) {
            optionsSelectionnees = optionItemRepository.findAllById(request.getOptionIds());
            validarOptionsPourProduit(produit, optionsSelectionnees);
        } else {
            validarOptionsPourProduit(produit, optionsSelectionnees);
        }

        // 3. Récupérer le panier
        Panier panier = getPanierEntityByUser(user);

        // 4. Vérifier si un item identique (même produit ET mêmes options) existe déjà
        Optional<PanierItem> itemExistant = trouverItemIdentique(panier, produit.getId(), request.getOptionIds());

        if (itemExistant.isPresent()) {
            PanierItem item = itemExistant.get();
            item.setQuantite(item.getQuantite() + request.getQuantite());
        } else {
            PanierItem nouveauItem = new PanierItem();
            nouveauItem.setPanier(panier);
            nouveauItem.setProduitMenu(produit);
            nouveauItem.setQuantite(request.getQuantite());

            // Attacher les options à l'item
            List<PanierItemOption> itemOptions = new ArrayList<>();
            for (OptionItem opt : optionsSelectionnees) {
                PanierItemOption pio = new PanierItemOption();
                pio.setPanierItem(nouveauItem);
                pio.setOptionItem(opt);
                itemOptions.add(pio);
            }
            nouveauItem.setOptions(itemOptions);

            panier.getPanierContenu().add(nouveauItem);
        }

        Panier panierSauvegarde = panierRepository.save(panier);
        return panierMapper.toResponse(panierSauvegarde);
    }

    private void validarOptionsPourProduit(ProduitMenu produit, List<OptionItem> optionsSelectionnees) {
        List<OptionGroupe> groupes = produit.getGroupesOptions();
        
        // Si le produit n'a aucun groupe d'options, rien à valider
        if (groupes == null || groupes.isEmpty()) {
            return;
        }

        // Regrouper les options sélectionnées par groupe
        Map<Long, Long> countsParGroupe = (optionsSelectionnees == null ? new ArrayList<OptionItem>() : optionsSelectionnees)
                .stream()
                .filter(opt -> opt.getGroupe() != null)
                .collect(Collectors.groupingBy(opt -> opt.getGroupe().getId(), Collectors.counting()));

        for (OptionGroupe groupe : groupes) {
            long total = countsParGroupe.getOrDefault(groupe.getId(), 0L);
            if (total < groupe.getMinSelection()) {
                throw new IllegalArgumentException("Veuillez choisir au moins " + groupe.getMinSelection() + " option(s) pour : " + groupe.getNom());
            }
            if (total > groupe.getMaxSelection()) {
                throw new IllegalArgumentException("Vous ne pouvez pas choisir plus de " + groupe.getMaxSelection() + " option(s) pour : " + groupe.getNom());
            }
        }
    }

    private Optional<PanierItem> trouverItemIdentique(Panier panier, Long produitId, List<Long> optionIds) {
        List<Long> idsTarget = (optionIds == null) ? new ArrayList<>() : optionIds.stream().sorted().toList();

        return panier.getPanierContenu().stream().filter(item -> {
            if (!item.getProduitMenu().getId().equals(produitId)) return false;

            List<Long> currentOptionIds = item.getOptions() == null ? new ArrayList<>() :
                    item.getOptions().stream().map(o -> o.getOptionItem().getId()).sorted().toList();

            return currentOptionIds.equals(idsTarget);
        }).findFirst();
    }

    @Transactional
    public PanierResponse modifierQuantite(User user, Long itemId, ModifierQuantiteRequest request) {
        Panier panier = getPanierEntityByUser(user);

        PanierItem item = panier.getPanierContenu().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Item du panier non trouvé avec l'id : " + itemId));

        if (request.getQuantite() <= 0) {
            panier.getPanierContenu().remove(item);
        } else {
            item.setQuantite(request.getQuantite());
        }

        Panier panierSauvegarde = panierRepository.save(panier);
        return panierMapper.toResponse(panierSauvegarde);
    }

    @Transactional
    public PanierResponse supprimerItem(User user, Long itemId) {
        Panier panier = getPanierEntityByUser(user);

        boolean supprime = panier.getPanierContenu().removeIf(item -> item.getId().equals(itemId));
        if (!supprime) {
            throw new ResourceNotFoundException("Item du panier non trouvé avec l'id : " + itemId);
        }

        Panier panierSauvegarde = panierRepository.save(panier);
        return panierMapper.toResponse(panierSauvegarde);
    }

    @Transactional
    public void viderPanier(User user) {
        Panier panier = getPanierEntityByUser(user);
        panier.getPanierContenu().clear();
        panierRepository.save(panier);
    }
}