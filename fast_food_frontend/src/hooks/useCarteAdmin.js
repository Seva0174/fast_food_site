import { useCallback, useEffect, useState } from 'react';
import {
  changerDisponibiliteApi,
  creerProduitApi,
  modifierProduitApi,
  supprimerProduitApi,
} from '@/api/carteApi';
import { getCategories, getProduits } from '@/api/menuApi';
import { getMatieresPremieresApi } from '@/api/stockApi';
import { verifierMiseEnVente } from '@/lib/carte';
import { useMessage } from './useMessage';
import { useExecuter } from './useExecuter';

// Carte en administration : produits, catégories, matières premières et modifications.
// `afficher` est exposé pour que la modale de produit affiche ses propres erreurs de saisie.
export const useCarteAdmin = () => {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [matieresPremieres, setMatieresPremieres] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const { message, afficher, effacer } = useMessage();

  // Seul le premier chargement affiche l'écran d'attente : les suivants laissent le tableau en place.
  const charger = useCallback(async () => {
    try {
      const [listeProduits, listeCategories, listeMatieres] = await Promise.all([
        getProduits(),
        getCategories(),
        getMatieresPremieresApi(),
      ]);
      setProduits(listeProduits);
      setCategories(listeCategories);
      setMatieresPremieres(listeMatieres);
      setErreur('');
    } catch (err) {
      console.error('Erreur lors de la récupération de la carte :', err);
      setErreur('Impossible de charger la carte.');
    } finally {
      setChargement(false);
    }
  }, []);

  const executer = useExecuter(afficher, charger);

  useEffect(() => {
    charger();
  }, [charger]);

  // Crée le produit si `produit` est nul, sinon le modifie. Renvoie false en cas d'échec ; à la création,
  // le produit créé (avec son id), pour que la fiche puisse continuer sur ses options ou sa composition.
  const enregistrer = (produit, payload) =>
    produit
      ? executer(
          () => modifierProduitApi(produit.id, payload),
          `${payload.nom} enregistré`,
          "Erreur lors de l'enregistrement du produit."
        )
      : executer(
          () => creerProduitApi(payload),
          payload.estDispo ? `${payload.nom} créé et mis en vente` : `${payload.nom} créé, hors vente`,
          "Erreur lors de l'enregistrement du produit."
        );

  // Bascule la mise en vente. Une mise en vente est refusée, avec la raison, si le produit ne serait pas
  // achetable ; le message qui suit un changement propose « Annuler ».
  const changerDisponibilite = async (produit) => {
    if (!produit.estDispo) {
      const { ok, raison } = verifierMiseEnVente(produit);
      if (!ok) {
        afficher(`${produit.nom} ne peut pas être mis en vente : ${raison}`, 'erreur', 8000);
        return false;
      }
    }
    const remettre = produit.estDispo;
    const annuler = () =>
      executer(
        () => changerDisponibiliteApi(produit.id),
        remettre ? `${produit.nom} est remis en vente` : `${produit.nom} est de nouveau hors vente`,
        'Erreur lors du changement de mise en vente.'
      );
    return executer(
      () => changerDisponibiliteApi(produit.id),
      {
        texte: remettre ? `${produit.nom} est hors vente` : `${produit.nom} est en vente`,
        action: { libelle: 'Annuler', onClick: annuler },
      },
      'Erreur lors du changement de mise en vente.'
    );
  };

  const supprimer = (produit) =>
    executer(
      () => supprimerProduitApi(produit.id),
      `${produit.nom} supprimé`,
      'Impossible de supprimer le produit.'
    );

  return {
    produits,
    categories,
    matieresPremieres,
    chargement,
    erreur,
    message,
    afficher,
    effacer,
    charger,
    enregistrer,
    changerDisponibilite,
    supprimer,
  };
};