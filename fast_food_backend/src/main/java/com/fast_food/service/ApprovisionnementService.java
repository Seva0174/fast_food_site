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

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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

    // --- FOURNISSEURS ---

    public List<FournisseurResponse> getAllFournisseurs() {
        return fournisseurRepository.findAll().stream()
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

        CommandeFournisseur commande = new CommandeFournisseur();
        commande.setFournisseur(fournisseur);
        commande.setDateCommande(LocalDate.now());
        commande.setStatus(CommandeFournisseur.Status.en_attente);

        CommandeFournisseur savedCommande = commandeFournisseurRepository.save(commande);
        List<CommandeFournisseurDetail> details = new ArrayList<>();

        for (CommandeFournisseurItemRequest itemReq : request.getItems()) {
            StockMatierePremiere stock = stockMatierePremiereRepository.findById(itemReq.getIdStock())
                    .orElseThrow(() -> new ResourceNotFoundException("Matière première non trouvée : " + itemReq.getIdStock()));

            CommandeFournisseurDetail detail = new CommandeFournisseurDetail();
            detail.setCommandeFournisseur(savedCommande);
            detail.setStock(stock);
            detail.setQuantite(itemReq.getQuantite());
            detail.setPrixUnitaire(itemReq.getPrixUnitaire());

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

        List<CommandeFournisseurDetail> details = commandeFournisseurDetailRepository.findByCommandeFournisseurId(idCommande);

        // Si la commande passe au statut 'recue' alors qu'elle ne l'était pas encore
        if (nouveauStatut == CommandeFournisseur.Status.recue && commande.getStatus() != CommandeFournisseur.Status.recue) {
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
        List<CommandeFournisseur> commandes = commandeFournisseurRepository.findAll();
        return commandes.stream().map(cmd -> {
            List<CommandeFournisseurDetail> details = commandeFournisseurDetailRepository.findByCommandeFournisseurId(cmd.getId());
            return commandeFournisseurMapper.toResponse(cmd, details);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CommandeDetailDTO> getDetailsCommande(Long idCommande) {
        if (!commandeFournisseurRepository.existsById(idCommande)) {
            throw new ResourceNotFoundException("Commande non trouvée avec l'ID : " + idCommande);
        }

        return commandeFournisseurDetailRepository.findByCommandeFournisseurId(idCommande)
                .stream()
                .map(d -> new CommandeDetailDTO(
                    (d.getStock() != null && d.getStock().getNom() != null) 
                            ? d.getStock().getNom() 
                            : "Article inconnu",
                    d.getQuantite() != null ? d.getQuantite().intValue() : 0,
                    d.getPrixUnitaire()
                ))
                .collect(Collectors.toList());
    }
}