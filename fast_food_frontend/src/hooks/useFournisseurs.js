import { useCallback, useEffect, useState } from 'react';
import {
  creerFournisseurApi,
  getCatalogueApi,
  getFournisseursApi,
  importerCatalogueCsvApi,
  supprimerFournisseurApi,
} from '@/api/approvisionnementApi';
import { extraireMessageErreur } from '@/lib/erreurs';

// Fournisseurs, sélection du fournisseur courant et catalogue associé.
// `afficher` vient de useMessage, pour partager un seul bandeau avec les commandes.
export const useFournisseurs = (afficher) => {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [idSelectionne, setIdSelectionne] = useState('');
  // Le catalogue garde l'identifiant de son fournisseur : on n'affiche jamais celui d'un autre
  const [catalogueCharge, setCatalogueCharge] = useState({ idFournisseur: '', articles: [] });
  const [chargement, setChargement] = useState(false);

  const charger = useCallback(async () => {
    try {
      const donnees = await getFournisseursApi();
      setFournisseurs(donnees);
      return donnees;
    } catch {
      afficher('Erreur lors du chargement des fournisseurs', 'erreur');
      return [];
    }
  }, [afficher]);

  // Au montage : charge la liste puis sélectionne le premier fournisseur
  useEffect(() => {
    charger().then((donnees) => {
      if (donnees.length > 0) {
        setIdSelectionne((courant) => courant || String(donnees[0].id));
      }
    });
  }, [charger]);

  // Charge le catalogue à chaque changement de fournisseur (y compris le premier)
  useEffect(() => {
    if (!idSelectionne) return undefined;

    let annule = false;
    getCatalogueApi(idSelectionne)
      .then((articles) => {
        if (!annule) setCatalogueCharge({ idFournisseur: idSelectionne, articles });
      })
      .catch(() => {
        if (!annule) afficher('Erreur lors du chargement du catalogue', 'erreur');
      });

    // Ignore la réponse d'un fournisseur qui n'est plus sélectionné
    return () => {
      annule = true;
    };
  }, [idSelectionne, afficher]);

  const catalogue = catalogueCharge.idFournisseur === idSelectionne ? catalogueCharge.articles : [];

  // Renvoie true si le fournisseur a été créé (il devient alors le fournisseur sélectionné).
  const creer = async (nom) => {
    if (!nom.trim()) return false;
    setChargement(true);
    try {
      const cree = await creerFournisseurApi({ nom: nom.trim() });
      afficher('Fournisseur créé avec succès');
      await charger();
      setIdSelectionne(String(cree.id));
      return true;
    } catch (err) {
      afficher(extraireMessageErreur(err) || 'Erreur lors de la création du fournisseur', 'erreur');
      return false;
    } finally {
      setChargement(false);
    }
  };

  // Renvoie true si le fournisseur a été supprimé (plus aucun fournisseur n'est alors sélectionné).
  const supprimer = async (id) => {
    setChargement(true);
    try {
      await supprimerFournisseurApi(id);
      afficher('Fournisseur supprimé');
      setIdSelectionne('');
      await charger();
      return true;
    } catch (err) {
      afficher(extraireMessageErreur(err) || 'Erreur lors de la suppression du fournisseur', 'erreur');
      return false;
    } finally {
      setChargement(false);
    }
  };

  // Remplace le catalogue du fournisseur sélectionné par le contenu du fichier CSV.
  const importerCatalogue = async (fichier) => {
    if (!fichier || !idSelectionne) return false;
    setChargement(true);
    try {
      const articles = await importerCatalogueCsvApi(idSelectionne, fichier);
      setCatalogueCharge({ idFournisseur: idSelectionne, articles });
      afficher('Catalogue mis à jour avec succès via le fichier CSV');
      return true;
    } catch {
      afficher("Erreur lors de l'import du fichier CSV", 'erreur');
      return false;
    } finally {
      setChargement(false);
    }
  };

  return {
    fournisseurs,
    idSelectionne,
    catalogue,
    chargement,
    selectionner: setIdSelectionne,
    creer,
    supprimer,
    importerCatalogue,
  };
};