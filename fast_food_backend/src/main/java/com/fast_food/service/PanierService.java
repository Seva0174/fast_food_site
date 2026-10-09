package com.fast_food.service;

import com.fast_food.dto.AjouterProduitRequest;
import com.fast_food.dto.ChoixFormuleRequest;
import com.fast_food.dto.ModifierQuantiteRequest;
import com.fast_food.dto.PanierResponse;
import com.fast_food.entite.FormuleGroupe;
import com.fast_food.entite.FormuleGroupeProduit;
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
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
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

        if (!produit.isEstDispo()) {
            throw new IllegalArgumentException("Ce produit n'est pas disponible actuellement.");
        }

        int quantite = request.getQuantite();
        if (quantite <= 0) {
            throw new IllegalArgumentException("La quantité doit être strictement positive.");
        }

        List<ChoixFormuleRequest> choixFormule = request.getChoixFormule() == null
                ? new ArrayList<>()
                : request.getChoixFormule();

        if (!produit.isEstFormule() && !choixFormule.isEmpty()) {
            throw new IllegalArgumentException("Le produit '" + produit.getNom() + "' n'est pas une formule.");
        }

        // 2. Construction de la ligne : options du produit + composition de la formule
        PanierItem nouvelItem = new PanierItem();
        nouvelItem.setProduitMenu(produit);
        nouvelItem.setQuantite(quantite);
        nouvelItem.setOptions(creerOptions(nouvelItem, chargerEtValiderOptions(produit, request.getOptionIds())));

        if (produit.isEstFormule()) {
            List<PanierItem> composants = construireComposants(nouvelItem, produit, choixFormule, quantite);
            validerCompositionFormule(produit, composants);
            nouvelItem.setComposants(composants);
        }

        // 3. Récupérer le panier
        Panier panier = getPanierEntityByUser(user);

        // 4. Fusionner avec une ligne identique (même produit, mêmes options, même composition)
        String cle = cleComposition(nouvelItem);
        Optional<PanierItem> itemExistant = panier.getPanierContenu().stream()
                .filter(item -> cle.equals(cleComposition(item)))
                .findFirst();

        if (itemExistant.isPresent()) {
            PanierItem item = itemExistant.get();
            item.setQuantite(item.getQuantite() + quantite);
            synchroniserQuantiteComposants(item);
        } else {
            nouvelItem.setPanier(panier);
            panier.getPanierContenu().add(nouvelItem);
        }

        Panier panierSauvegarde = panierRepository.save(panier);
        return panierMapper.toResponse(panierSauvegarde);
    }

    // ------------------------------------------------------------------
    // Options d'un produit
    // ------------------------------------------------------------------

    // Charge les options demandées et vérifie qu'elles respectent les règles du produit
    private List<OptionItem> chargerEtValiderOptions(ProduitMenu produit, List<Long> optionIds) {
        List<Long> ids = optionIds == null ? new ArrayList<>() : optionIds;

        if (new HashSet<>(ids).size() != ids.size()) {
            throw new IllegalArgumentException("Une même option ne peut pas être sélectionnée deux fois.");
        }

        List<OptionItem> options = ids.isEmpty() ? new ArrayList<>() : optionItemRepository.findAllById(ids);
        if (options.size() != ids.size()) {
            throw new ResourceNotFoundException("Une des options sélectionnées est introuvable.");
        }

        validerOptionsPourProduit(produit, options);
        return options;
    }

    private void validerOptionsPourProduit(ProduitMenu produit, List<OptionItem> optionsSelectionnees) {
        List<OptionGroupe> groupes = produit.getGroupesOptions() == null
                ? new ArrayList<>()
                : produit.getGroupesOptions();

        // Chaque option doit appartenir à un groupe d'options du produit
        Set<Long> idsGroupesProduit = groupes.stream().map(OptionGroupe::getId).collect(Collectors.toSet());
        for (OptionItem opt : optionsSelectionnees) {
            if (opt.getGroupe() == null || !idsGroupesProduit.contains(opt.getGroupe().getId())) {
                throw new IllegalArgumentException("L'option '" + opt.getNom() + "' n'est pas proposée pour le produit '" + produit.getNom() + "'.");
            }
        }

        // Si le produit n'a aucun groupe d'options, rien d'autre à valider
        if (groupes.isEmpty()) {
            return;
        }

        // Regrouper les options sélectionnées par groupe
        Map<Long, Long> countsParGroupe = optionsSelectionnees.stream()
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

    private List<PanierItemOption> creerOptions(PanierItem item, List<OptionItem> options) {
        List<PanierItemOption> liste = new ArrayList<>();
        for (OptionItem opt : options) {
            PanierItemOption pio = new PanierItemOption();
            pio.setPanierItem(item);
            pio.setOptionItem(opt);
            liste.add(pio);
        }
        return liste;
    }

    // ------------------------------------------------------------------
    // Formules
    // ------------------------------------------------------------------

    // Transforme les choix du client en lignes enfants (non rattachées directement au panier)
    private List<PanierItem> construireComposants(PanierItem racine, ProduitMenu formule,
                                                  List<ChoixFormuleRequest> choix, int quantite) {
        List<PanierItem> composants = new ArrayList<>();

        for (ChoixFormuleRequest c : choix) {
            if (c.getIdGroupe() == null || c.getIdProduit() == null) {
                throw new IllegalArgumentException("Un choix de la formule est incomplet.");
            }

            FormuleGroupe groupe = formule.getGroupesFormule().stream()
                    .filter(g -> g.getId().equals(c.getIdGroupe()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException(
                            "L'emplacement " + c.getIdGroupe() + " n'appartient pas à la formule '" + formule.getNom() + "'."));

            FormuleGroupeProduit lien = groupe.getProduits().stream()
                    .filter(l -> l.getProduit().getId().equals(c.getIdProduit()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Le produit " + c.getIdProduit() + " n'est pas proposé dans l'emplacement '" + groupe.getNom() + "'."));

            ProduitMenu produitChoisi = lien.getProduit();
            List<OptionItem> options = chargerEtValiderOptions(produitChoisi, c.getOptionIds());

            PanierItem enfant = new PanierItem();
            enfant.setParent(racine);
            enfant.setFormuleGroupe(groupe);
            enfant.setProduitMenu(produitChoisi);
            enfant.setQuantite(quantite);
            enfant.setOptions(creerOptions(enfant, options));
            composants.add(enfant);
        }

        return composants;
    }

    /**
     * Vérifie qu'une composition de formule est valide : chaque produit appartient à son emplacement,
     * est disponible, et le nombre de choix par emplacement respecte le minimum et le maximum.
     * Utilisée à l'ajout au panier et à la validation de la commande.
     */
    public void validerCompositionFormule(ProduitMenu formule, List<PanierItem> composants) {
        List<FormuleGroupe> groupes = formule.getGroupesFormule();
        if (groupes == null || groupes.isEmpty()) {
            throw new IllegalArgumentException("La formule '" + formule.getNom() + "' n'est pas encore configurée.");
        }

        List<PanierItem> choix = composants == null ? new ArrayList<>() : composants;
        Set<Long> idsGroupes = groupes.stream().map(FormuleGroupe::getId).collect(Collectors.toSet());
        String messageInvalide = "La composition de la formule '" + formule.getNom() + "' n'est plus valide. Veuillez la recomposer.";

        for (PanierItem composant : choix) {
            FormuleGroupe groupe = composant.getFormuleGroupe();
            ProduitMenu produit = composant.getProduitMenu();

            if (groupe == null || !idsGroupes.contains(groupe.getId())) {
                throw new IllegalArgumentException(messageInvalide);
            }

            boolean autorise = groupe.getProduits().stream()
                    .anyMatch(lien -> lien.getProduit().getId().equals(produit.getId()));
            if (!autorise || produit.isEstFormule()) {
                throw new IllegalArgumentException(messageInvalide);
            }

            if (!produit.isEstDispo()) {
                throw new IllegalArgumentException("Le produit '" + produit.getNom() + "' n'est plus disponible pour la formule '" + formule.getNom() + "'.");
            }
        }

        Map<Long, Long> countsParGroupe = choix.stream()
                .collect(Collectors.groupingBy(c -> c.getFormuleGroupe().getId(), Collectors.counting()));

        for (FormuleGroupe groupe : groupes) {
            long total = countsParGroupe.getOrDefault(groupe.getId(), 0L);
            if (total < groupe.getMinSelection()) {
                throw new IllegalArgumentException("Veuillez choisir au moins " + groupe.getMinSelection() + " produit(s) pour : " + groupe.getNom());
            }
            if (total > groupe.getMaxSelection()) {
                throw new IllegalArgumentException("Vous ne pouvez pas choisir plus de " + groupe.getMaxSelection() + " produit(s) pour : " + groupe.getNom());
            }
        }
    }

    // Les composants ont toujours la même quantité que la ligne de la formule
    private void synchroniserQuantiteComposants(PanierItem racine) {
        if (racine.getComposants() != null) {
            racine.getComposants().forEach(composant -> composant.setQuantite(racine.getQuantite()));
        }
    }

    // ------------------------------------------------------------------
    // Identification d'une ligne identique
    // ------------------------------------------------------------------

    // Clé unique d'une ligne : produit + options + composition de la formule
    private String cleComposition(PanierItem item) {
        String cleComposants = item.getComposants() == null ? "" : item.getComposants().stream()
                .map(c -> c.getFormuleGroupe().getId() + ":" + c.getProduitMenu().getId() + ":" + cleOptions(c))
                .sorted()
                .collect(Collectors.joining("|"));

        return item.getProduitMenu().getId() + "#" + cleOptions(item) + "#" + cleComposants;
    }

    private String cleOptions(PanierItem item) {
        if (item.getOptions() == null) {
            return "";
        }
        return item.getOptions().stream()
                .map(o -> o.getOptionItem().getId())
                .sorted()
                .map(String::valueOf)
                .collect(Collectors.joining(","));
    }

    // ------------------------------------------------------------------
    // Modification du panier
    // ------------------------------------------------------------------

    @Transactional
    public PanierResponse modifierQuantite(User user, Long itemId, ModifierQuantiteRequest request) {
        Panier panier = getPanierEntityByUser(user);

        PanierItem item = panier.getPanierContenu().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Item du panier non trouvé avec l'id : " + itemId));

        if (request.getQuantite() <= 0) {
            // Les composants sont supprimés en cascade avec leur ligne parent
            panier.getPanierContenu().remove(item);
        } else {
            item.setQuantite(request.getQuantite());
            synchroniserQuantiteComposants(item);
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