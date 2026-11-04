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
// `afficher` vient de useMessage, pour partager un seul message avec les commandes.
// chargement / erreur : liste des fournisseurs ; enCours : une action attend le serveur.
export const useFournisseurs = (afficher) => {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [idSelectionne, setIdSelectionne] = useState('');
  // Le catalogue garde l'identifiant de son fournisseur : on n'affiche jamais celui d'un autre
  const [catalogueCharge, setCatalogueCharge] = useState({ idFournisseur: '', articles: [], erreur: false });
  // Incrémenté pour relancer le chargement du catalogue après une erreur
  const [essaiCatalogue, setEssaiCatalogue] = useState(0);

  const lireListe = useCallback(async () => {
    const donnees = await getFournisseursApi();
    setFournisseurs(donnees);
    return donnees;
  }, []);

  // Charge la liste puis sélectionne le premier fournisseur si aucun ne l'est
  const charger = useCallback(async () => {
    try {
      const donnees = await lireListe();
      setErreur('');
      if (donnees.length > 0) {
        setIdSelectionne((courant) => courant || String(donnees[0].id));
      }
    } catch {
      setErreur('Impossible de charger les fournisseurs.');
    } finally {
      setChargement(false);
    }
  }, [lireListe]);

  useEffect(() => {
    charger();
  }, [charger]);

  // Charge le catalogue à chaque changement de fournisseur (y compris le premier)
  useEffect(() => {
    if (!idSelectionne) return undefined;

    let annule = false;
    getCatalogueApi(idSelectionne)
      .then((articles) => {
        if (!annule) setCatalogueCharge({ idFournisseur: idSelectionne, articles, erreur: false });
      })
      .catch(() => {
        if (!annule) setCatalogueCharge({ idFournisseur: idSelectionne, articles: [], erreur: true });
      });

    // Ignore la réponse d'un fournisseur qui n'est plus sélectionné
    return () => {
      annule = true;
    };
  }, [idSelectionne, essaiCatalogue]);

  const catalogueAJour = catalogueCharge.idFournisseur === idSelectionne;
  const catalogue = catalogueAJour ? catalogueCharge.articles : [];
  const chargementCatalogue = Boolean(idSelectionne) && !catalogueAJour;
  const erreurCatalogue = catalogueAJour && catalogueCharge.erreur;

  const rechargerCatalogue = () => {
    setCatalogueCharge({ idFournisseur: '', articles: [], erreur: false });
    setEssaiCatalogue((n) => n + 1);
  };

  // Renvoie true si le fournisseur a été créé (il devient alors le fournisseur sélectionné).
  const creer = async (nom) => {
    if (!nom.trim()) return false;
    setEnCours(true);
    try {
      const cree = await creerFournisseurApi({ nom: nom.trim() });
      afficher(`Fournisseur « ${nom.trim()} » créé`);
      await lireListe();
      setIdSelectionne(String(cree.id));
      return true;
    } catch (err) {
      afficher(extraireMessageErreur(err) || 'Erreur lors de la création du fournisseur', 'erreur');
      return false;
    } finally {
      setEnCours(false);
    }
  };

  // Renvoie true si le fournisseur a été supprimé (le premier fournisseur restant est alors sélectionné).
  const supprimer = async (id) => {
    setEnCours(true);
    try {
      await supprimerFournisseurApi(id);
      afficher('Fournisseur supprimé');
      const restants = await lireListe();
      setIdSelectionne(restants.length > 0 ? String(restants[0].id) : '');
      return true;
    } catch (err) {
      afficher(extraireMessageErreur(err) || 'Erreur lors de la suppression du fournisseur', 'erreur');
      return false;
    } finally {
      setEnCours(false);
    }
  };

  // Remplace le catalogue du fournisseur sélectionné par le contenu du fichier CSV.
  const importerCatalogue = async (fichier) => {
    if (!fichier || !idSelectionne) return false;
    setEnCours(true);
    try {
      const articles = await importerCatalogueCsvApi(idSelectionne, fichier);
      setCatalogueCharge({ idFournisseur: idSelectionne, articles, erreur: false });
      afficher(`Catalogue importé : ${articles.length} article${articles.length > 1 ? 's' : ''}`);
      return true;
    } catch (err) {
      afficher(
        extraireMessageErreur(err) || "Import impossible : vérifie que chaque ligne suit le format nom_matiere;prix_unitaire",
        'erreur'
      );
      return false;
    } finally {
      setEnCours(false);
    }
  };

  return {
    fournisseurs,
    chargement,
    erreur,
    enCours,
    idSelectionne,
    catalogue,
    chargementCatalogue,
    erreurCatalogue,
    charger,
    rechargerCatalogue,
    selectionner: setIdSelectionne,
    creer,
    supprimer,
    importerCatalogue,
  };
};
