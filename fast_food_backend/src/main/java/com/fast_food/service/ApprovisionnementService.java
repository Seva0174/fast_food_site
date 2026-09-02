package com.fast_food.service;

import com.fast_food.dto.*;
import com.fast_food.entite.*;
import com.fast_food.exception.ResourceNotFoundException;
import com.fast_food.mapper.*;
import com.fast_food.repositorie.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    // --- CATALOGUE FOURNISSEUR ---

    public CatalogueFournisseurResponse ajouterArticleCatalogue(CatalogueFournisseurRequest request) {
        Fournisseur fournisseur = fournisseurRepository.findById(request.getIdFournisseur())
                .orElseThrow(() -> new ResourceNotFoundException("Fournisseur non trouvé"));

        StockMatierePremiere stock = stockMatierePremiereRepository.findById(request.getIdStock())
                .orElseThrow(() -> new ResourceNotFoundException("Matière première non trouvée"));

        CatalogueFournisseur article = new CatalogueFournisseur();
        article.setFournisseur(fournisseur);
        article.setStock(stock);
        article.setPrixUnitaire(request.getPrixUnitaire());

        return catalogueFournisseurMapper.toResponse(catalogueFournisseurRepository.save(article));
    }

    public List<CatalogueFournisseurResponse> getCatalogueByFournisseur(Long idFournisseur) {
        return catalogueFournisseurRepository.findByFournisseurId(idFournisseur).stream()
                .map(catalogueFournisseurMapper::toResponse)
                .collect(Collectors.toList());
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
}