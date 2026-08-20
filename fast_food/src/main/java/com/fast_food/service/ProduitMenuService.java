package com.fast_food.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fast_food.dto.ProduitMenuRequest;
import com.fast_food.dto.ProduitMenuResponse;
import com.fast_food.entite.Categorie;
import com.fast_food.entite.ProduitMenu;
import com.fast_food.exception.ResourceNotFoundException;
import com.fast_food.mapper.ProduitMenuMapper;
import com.fast_food.repositorie.CategorieRepository;
import com.fast_food.repositorie.ProduitMenuRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProduitMenuService {

    private final ProduitMenuRepository produitMenuRepository;
    private final CategorieRepository categorieRepository;
    private final ProduitMenuMapper produitMenuMapper;

    // Récupérer tous les produits (Admin)
    @Transactional(readOnly = true)
    public List<ProduitMenuResponse> getAllProduits() {
        return produitMenuRepository.findAll().stream()
                .map(produitMenuMapper::toProduitMenuResponse)
                .collect(Collectors.toList());
    }

    // Récupérer un produit par son ID
    @Transactional(readOnly = true)
    public ProduitMenuResponse getProduitById(Long id) {
        ProduitMenu produit = produitMenuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable avec l'ID : " + id));
        return produitMenuMapper.toProduitMenuResponse(produit);
    }

    // Récupérer les produits par catégorie
    @Transactional(readOnly = true)
    public List<ProduitMenuResponse> getProduitsByCategorie(Long categorieId) {
        if (!categorieRepository.existsById(categorieId)) {
            throw new ResourceNotFoundException("Catégorie introuvable avec l'ID : " + categorieId);
        }
        
        // Note: Assure-toi d'avoir défini la méthode 'findByCategorieId' dans ProduitMenuRepository
        return produitMenuRepository.findByCategorieId(categorieId).stream()
                .map(produitMenuMapper::toProduitMenuResponse)
                .collect(Collectors.toList());
    }

    // Créer un produit (Réservé Admin)
    @Transactional
    public ProduitMenuResponse createProduit(ProduitMenuRequest request) {
        // Vérification de l'existence de la catégorie
        Categorie categorie = categorieRepository.findById(request.getIdCategorie())
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable avec l'ID : " + request.getIdCategorie()));

        ProduitMenu produit = produitMenuMapper.toEntity(request);
        produit.setCategorie(categorie); // On attache l'entité managée complète

        ProduitMenu savedProduit = produitMenuRepository.save(produit);
        return produitMenuMapper.toProduitMenuResponse(savedProduit);
    }

    // Modifier un produit (Réservé Admin)
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
        return produitMenuMapper.toProduitMenuResponse(updatedProduit);
    }

    // Basculer la disponibilité d'un produit (Rupture / Retour en stock)
    @Transactional
    public ProduitMenuResponse toggleDisponibilite(Long id) {
        ProduitMenu produit = produitMenuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable avec l'ID : " + id));

        produit.setEstDispo(!produit.isEstDispo());
        ProduitMenu updatedProduit = produitMenuRepository.save(produit);
        return produitMenuMapper.toProduitMenuResponse(updatedProduit);
    }

    // Supprimer un produit (Réservé Admin)
    @Transactional
    public void deleteProduit(Long id) {
        if (!produitMenuRepository.existsById(id)) {
            throw new ResourceNotFoundException("Produit introuvable avec l'ID : " + id);
        }
        produitMenuRepository.deleteById(id);
    }
}