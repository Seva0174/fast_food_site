package com.fast_food.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fast_food.dto.ProduitMenuRequest;
import com.fast_food.dto.ProduitMenuResponse;
import com.fast_food.dto.RecetteItemResponse;
import com.fast_food.entite.Categorie;
import com.fast_food.entite.ProduitMenu;
import com.fast_food.entite.Recette;
import com.fast_food.entite.StockMatierePremiere;
import com.fast_food.exception.ResourceNotFoundException;
import com.fast_food.mapper.ProduitMenuMapper;
import com.fast_food.repositorie.CategorieRepository;
import com.fast_food.repositorie.ProduitMenuRepository;
import com.fast_food.repositorie.RecetteRepository;
import com.fast_food.repositorie.StockMatierePremiereRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProduitMenuService {

    private final ProduitMenuRepository produitMenuRepository;
    private final CategorieRepository categorieRepository;
    private final RecetteRepository recetteRepository; 
    private final StockMatierePremiereRepository stockMatierePremiereRepository; 
    private final ProduitMenuMapper produitMenuMapper;

    @Transactional(readOnly = true)
    public List<ProduitMenuResponse> getAllProduits() {
        return produitMenuRepository.findAllByOrderByCategorieIdAscIdAsc().stream()
                .map(this::mapToResponseWithRecette)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProduitMenuResponse getProduitById(Long id) {
        ProduitMenu produit = produitMenuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable avec l'ID : " + id));
        return mapToResponseWithRecette(produit);
    }

    @Transactional(readOnly = true)
    public List<ProduitMenuResponse> getProduitsByCategorie(Long categorieId) {
        if (!categorieRepository.existsById(categorieId)) {
            throw new ResourceNotFoundException("Catégorie introuvable avec l'ID : " + categorieId);
        }
        
        return produitMenuRepository.findByCategorieIdOrderByIdAsc(categorieId).stream()
                .map(this::mapToResponseWithRecette)
                .collect(Collectors.toList());
    }

    // Créer un produit avec sa recette (Admin)
    @Transactional
    public ProduitMenuResponse createProduit(ProduitMenuRequest request) {
        Categorie categorie = categorieRepository.findById(request.getIdCategorie())
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable avec l'ID : " + request.getIdCategorie()));

        ProduitMenu produit = produitMenuMapper.toEntity(request);
        produit.setCategorie(categorie);

        ProduitMenu savedProduit = produitMenuRepository.save(produit);

        // Sauvegarder la recette si fournie
        enregistrerRecette(savedProduit, request);

        return mapToResponseWithRecette(savedProduit);
    }

    // Modifier un produit et sa recette (Admin)
    @Transactional
    public ProduitMenuResponse updateProduit(Long id, ProduitMenuRequest request) {
        ProduitMenu produit = produitMenuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable avec l'ID : " + id));

        Categorie categorie = categorieRepository.findById(request.getIdCategorie())
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable avec l'ID : " + request.getIdCategorie()));

        produit.setNom(request.getNom());
        produit.setDescription(request.getDescription());
        produit.setPrix(request.getPrix());
        produit.setImageUrl(request.getImageUrl());
        if (request.getEstDispo() != null) {
            produit.setEstDispo(request.getEstDispo());
        }
        produit.setCategorie(categorie);

        ProduitMenu updatedProduit = produitMenuRepository.save(produit);

        // Réinitialiser et enregistrer la nouvelle recette
        recetteRepository.deleteByProduitMenu(updatedProduit);
        enregistrerRecette(updatedProduit, request);

        return mapToResponseWithRecette(updatedProduit);
    }

    private void enregistrerRecette(ProduitMenu produit, ProduitMenuRequest request) {
        if (request.getRecette() != null && !request.getRecette().isEmpty()) {
            List<Recette> recettes = new ArrayList<>();
            for (var item : request.getRecette()) {
                StockMatierePremiere matiere = stockMatierePremiereRepository.findById(item.getIdMatiere())
                        .orElseThrow(() -> new ResourceNotFoundException("Matière première introuvable : " + item.getIdMatiere()));

                Recette r = new Recette();
                r.setProduitMenu(produit);
                r.setMatierePremiere(matiere);
                r.setQuantiteRequise(item.getQuantiteRequise());
                recettes.add(r);
            }
            recetteRepository.saveAll(recettes);
        }
    }

    private ProduitMenuResponse mapToResponseWithRecette(ProduitMenu produit) {
        ProduitMenuResponse response = produitMenuMapper.toProduitMenuResponse(produit);
        List<Recette> recettes = recetteRepository.findByProduitMenu(produit);

        List<RecetteItemResponse> recetteResponses = recettes.stream().map(r -> {
            RecetteItemResponse item = new RecetteItemResponse();
            item.setIdMatiere(r.getMatierePremiere().getId());
            item.setNomMatiere(r.getMatierePremiere().getNom());
            item.setQuantiteRequise(r.getQuantiteRequise());
            return item;
        }).collect(Collectors.toList());

        response.setRecette(recetteResponses);
        return response;
    }

    @Transactional
    public ProduitMenuResponse toggleDisponibilite(Long id) {
        ProduitMenu produit = produitMenuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable avec l'ID : " + id));

        produit.setEstDispo(!produit.isEstDispo());
        ProduitMenu updatedProduit = produitMenuRepository.save(produit);
        return mapToResponseWithRecette(updatedProduit);
    }

    @Transactional
    public void deleteProduit(Long id) {
        ProduitMenu produit = produitMenuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable avec l'ID : " + id));
        recetteRepository.deleteByProduitMenu(produit);
        produitMenuRepository.delete(produit);
    }
}