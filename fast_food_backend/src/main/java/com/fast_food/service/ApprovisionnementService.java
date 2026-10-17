package com.fast_food.service;

import com.fast_food.dto.*;
import com.fast_food.entite.*;
import com.fast_food.exception.ResourceNotFoundException;
import com.fast_food.mapper.*;
import com.fast_food.repositorie.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Sort;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
public class ApprovisionnementService {

    private final FournisseurRepository fournisseurRepository;
    private final CatalogueFournisseurRepository catalogueFournisseurRepository;
    private final CommandeFournisseurRepository commandeFournisseurRepository;
    private final CommandeFournisseurDetailRepository commandeFournisseurDetailRepository;
    private final StockMatierePremiereRepository stockMatierePremiereRepository;

    private final FournisseurMapper fournisseurMapper;
    private final CatalogueFournisseurMapper catalogueFournisseurMapper;
    private final CommandeFournisseurMapper commandeFournisseurMapper;

    // Transitions de statut autorisées pour une commande fournisseur.
    // 'recue' et 'annulee' sont des états finaux.
    private static final Map<CommandeFournisseur.Status, Set<CommandeFournisseur.Status>> TRANSITIONS_AUTORISEES = Map.of(
            CommandeFournisseur.Status.en_attente,
            EnumSet.of(CommandeFournisseur.Status.expediee, CommandeFournisseur.Status.annulee),
            CommandeFournisseur.Status.expediee,
            EnumSet.of(CommandeFournisseur.Status.recue, CommandeFournisseur.Status.annulee),
            CommandeFournisseur.Status.recue,
            EnumSet.noneOf(CommandeFournisseur.Status.class),
            CommandeFournisseur.Status.annulee,
            EnumSet.noneOf(CommandeFournisseur.Status.class)
    );

    private void verifierTransition(CommandeFournisseur.Status actuel, CommandeFournisseur.Status nouveau) {
        if (!TRANSITIONS_AUTORISEES.get(actuel).contains(nouveau)) {
            throw new IllegalArgumentException(
                    "Changement de statut interdit : " + actuel + " vers " + nouveau);
        }
    }

    // --- FOURNISSEURS ---

    public List<FournisseurResponse> getAllFournisseurs() {
        return fournisseurRepository.findAll(Sort.by("id")).stream()
                .map(fournisseurMapper::toResponse)
                .collect(Collectors.toList());
    }

    public FournisseurResponse createFournisseur(FournisseurRequest request) {
        Fournisseur f = fournisseurMapper.toEntity(request);
        return fournisseurMapper.toResponse(fournisseurRepository.save(f));
    }

    @Transactional
    public void deleteFournisseur(Long idFournisseur) {
        Fournisseur fournisseur = fournisseurRepository.findById(idFournisseur)
                .orElseThrow(() -> new ResourceNotFoundException("Fournisseur non trouvé"));

        // 1. Purger les articles du catalogue
        List<CatalogueFournisseur> catalogue = catalogueFournisseurRepository.findByFournisseurId(idFournisseur);
        catalogueFournisseurRepository.deleteAll(catalogue);

        // 2. Supprimer les commandes associées s'il y en a
        List<CommandeFournisseur> commandes = commandeFournisseurRepository.findByFournisseurId(idFournisseur);
        for (CommandeFournisseur cmd : commandes) {
            List<CommandeFournisseurDetail> details = commandeFournisseurDetailRepository.findByCommandeFournisseurId(cmd.getId());
            commandeFournisseurDetailRepository.deleteAll(details);
        }
        commandeFournisseurRepository.deleteAll(commandes);

        // 3. Supprimer le fournisseur
        fournisseurRepository.delete(fournisseur);
    }

    // --- CATALOGUE FOURNISSEUR ---

    public List<CatalogueFournisseurResponse> getCatalogueByFournisseur(Long idFournisseur) {
        return catalogueFournisseurRepository.findByFournisseurId(idFournisseur).stream()
                .sorted(Comparator.comparing(CatalogueFournisseur::getId))
                .map(catalogueFournisseurMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<CatalogueFournisseurResponse> importerCatalogueCsv(Long idFournisseur, MultipartFile file) {
        Fournisseur fournisseur = fournisseurRepository.findById(idFournisseur)
                .orElseThrow(() -> new ResourceNotFoundException("Fournisseur non trouvé"));

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier CSV fourni est vide");
        }

        // Supprimer l'ancien catalogue du fournisseur avant le réimport
        List<CatalogueFournisseur> ancienCatalogue = catalogueFournisseurRepository.findByFournisseurId(idFournisseur);
        catalogueFournisseurRepository.deleteAll(ancienCatalogue);

        List<CatalogueFournisseur> nouveauxArticles = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean isFirstLine = true;

            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;

                // Sauter l'en-tête (ex: nom;prix) s'il existe
                if (isFirstLine && (line.toLowerCase().contains("nom") || line.toLowerCase().contains("prix"))) {
                    isFirstLine = false;
                    continue;
                }
                isFirstLine = false;

                String[] data = line.split("[;,]");
                if (data.length < 2) continue;

                String nomMatiere = data[0].trim();
                BigDecimal prixUnitaire = new BigDecimal(data[1].trim().replace(",", "."));

                // Trouver ou créer la matière première dans le stock de la cuisine
                StockMatierePremiere stock = stockMatierePremiereRepository.findByNomIgnoreCase(nomMatiere)
                        .orElseGet(() -> {
                            StockMatierePremiere nouvelleMatiere = new StockMatierePremiere();
                            nouvelleMatiere.setNom(nomMatiere);
                            nouvelleMatiere.setQuantite(BigDecimal.ZERO);
                            return stockMatierePremiereRepository.save(nouvelleMatiere);
                        });

                CatalogueFournisseur article = new CatalogueFournisseur();
                article.setFournisseur(fournisseur);
                article.setStock(stock);
                article.setPrixUnitaire(prixUnitaire);

                nouveauxArticles.add(catalogueFournisseurRepository.save(article));
            }

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la lecture du fichier CSV : " + e.getMessage(), e);
        }

        return nouveauxArticles.stream()
                .map(catalogueFournisseurMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void reinitialiserCatalogue(Long idFournisseur) {
        List<CatalogueFournisseur> catalogue = catalogueFournisseurRepository.findByFournisseurId(idFournisseur);
        catalogueFournisseurRepository.deleteAll(catalogue);
    }

    // --- COMMANDES D'ACHAT ---

    @Transactional
    public CommandeFournisseurResponse passerCommande(CreerCommandeFournisseurRequest request) {
        Fournisseur fournisseur = fournisseurRepository.findById(request.getIdFournisseur())
                .orElseThrow(() -> new ResourceNotFoundException("Fournisseur non trouvé"));

        // Les prix viennent du catalogue du fournisseur, jamais du client
        Map<Long, BigDecimal> prixCatalogue = catalogueFournisseurRepository
                .findByFournisseurId(request.getIdFournisseur()).stream()
                .collect(Collectors.toMap(
                        article -> article.getStock().getId(),
                        CatalogueFournisseur::getPrixUnitaire,
                        (premier, doublon) -> premier));

        CommandeFournisseur commande = new CommandeFournisseur();
        commande.setFournisseur(fournisseur);
        commande.setDateCommande(LocalDate.now());
        commande.setStatus(CommandeFournisseur.Status.en_attente);

        CommandeFournisseur savedCommande = commandeFournisseurRepository.save(commande);
        List<CommandeFournisseurDetail> details = new ArrayList<>();

        for (CommandeFournisseurItemRequest itemReq : request.getItems()) {
            StockMatierePremiere stock = stockMatierePremiereRepository.findById(itemReq.getIdStock())
                    .orElseThrow(() -> new ResourceNotFoundException("Matière première non trouvée : " + itemReq.getIdStock()));

            BigDecimal prixUnitaire = prixCatalogue.get(stock.getId());
            if (prixUnitaire == null) {
                throw new IllegalArgumentException(
                        "Cet article n'appartient pas au catalogue du fournisseur : " + stock.getNom());
            }

            CommandeFournisseurDetail detail = new CommandeFournisseurDetail();
            detail.setCommandeFournisseur(savedCommande);
            detail.setStock(stock);
            detail.setQuantite(itemReq.getQuantite());
            detail.setPrixUnitaire(prixUnitaire);

            details.add(commandeFournisseurDetailRepository.save(detail));
        }

        return commandeFournisseurMapper.toResponse(savedCommande, details);
    }

    @Transactional
    public CommandeFournisseurResponse changerStatutCommande(Long idCommande, String statusStr) {
        CommandeFournisseur commande = commandeFournisseurRepository.findById(idCommande)
                .orElseThrow(() -> new ResourceNotFoundException("Commande fournisseur non trouvée"));

        CommandeFournisseur.Status nouveauStatut;
        try {
            nouveauStatut = CommandeFournisseur.Status.valueOf(statusStr.toLowerCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Statut invalide : " + statusStr);
        }

        // Refuse les transitions interdites avant toute modification du stock
        verifierTransition(commande.getStatus(), nouveauStatut);

        List<CommandeFournisseurDetail> details = commandeFournisseurDetailRepository.findByCommandeFournisseurId(idCommande);

        // La transition étant validée, 'recue' n'est atteint que depuis 'expediee' : le stock est crédité une seule fois
        if (nouveauStatut == CommandeFournisseur.Status.recue) {
            for (CommandeFournisseurDetail detail : details) {
                StockMatierePremiere stock = detail.getStock();
                stock.setQuantite(stock.getQuantite().add(detail.getQuantite()));
                stockMatierePremiereRepository.save(stock);
            }
            commande.setDateReception(LocalDate.now());
        }

        commande.setStatus(nouveauStatut);
        CommandeFournisseur updatedCommande = commandeFournisseurRepository.save(commande);

        return commandeFournisseurMapper.toResponse(updatedCommande, details);
    }

    public List<CommandeFournisseurResponse> getAllCommandes() {
        List<CommandeFournisseur> commandes = commandeFournisseurRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        return commandes.stream().map(cmd -> {
            List<CommandeFournisseurDetail> details = commandeFournisseurDetailRepository.findByCommandeFournisseurId(cmd.getId());
            return commandeFournisseurMapper.toResponse(cmd, details);
        }).collect(Collectors.toList());
    }

    //   ---- STOCK -----

    @Transactional(readOnly = true)
    public List<StockMatierePremiere> getAllMatieresPremieres() {
        return stockMatierePremiereRepository.findAllByOrderByIdAsc();    
    }

    @Transactional
    public StockMatierePremiere modifierStock(Long id, BigDecimal nouvelleQuantite, String uniteMesure) {
        StockMatierePremiere stock = stockMatierePremiereRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matière première introuvable avec l'ID : " + id));
        
        if (nouvelleQuantite != null) {
            stock.setQuantite(nouvelleQuantite);
        }
        if (uniteMesure != null && !uniteMesure.isBlank()) {
            stock.setUniteMesure(uniteMesure);
        }
        return stockMatierePremiereRepository.save(stock);
    }

    @Transactional
    public StockMatierePremiere creerMatierePremiere(CreerMatierePremiereRequest request) {
        String nom = request.getNom().trim();

        if (stockMatierePremiereRepository.findByNomIgnoreCase(nom).isPresent()) {
            throw new IllegalArgumentException("Une matière première avec ce nom existe déjà.");
        }

        StockMatierePremiere matiere = new StockMatierePremiere();
        matiere.setNom(nom);
        matiere.setQuantite(request.getQuantite());
        matiere.setUniteMesure(request.getUniteMesure() != null ? request.getUniteMesure() : "unite");

        return stockMatierePremiereRepository.save(matiere);
    }

    @Transactional
    public void supprimerMatierePremiere(Long id) {
        StockMatierePremiere matiere = stockMatierePremiereRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matière première introuvable avec l'ID : " + id));

        try {
            stockMatierePremiereRepository.delete(matiere);
            stockMatierePremiereRepository.flush(); // Force l'exécution du DELETE SQL immédiatement pour intercepter les exceptions FK
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Impossible de supprimer cette matière première car elle est liée à des recettes ou à des commandes d'achat.");
        }
    }
}