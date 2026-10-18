import { useCallback, useEffect, useState } from 'react';
import {
  changerDisponibiliteApi,
  creerProduitApi,
  modifierProduitApi,
  supprimerProduitApi,
} from '@/api/carteApi';
import { getCategories, getProduits } from '@/api/menuApi';
import { getMatieresPremieresApi } from '@/api/stockApi';
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
  const { message, afficher } = useMessage();

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

  // Crée le produit si `produit` est nul, sinon le modifie.
  const enregistrer = (produit, payload) =>
    produit
      ? executer(
          () => modifierProduitApi(produit.id, payload),
          'Produit modifié',
          "Erreur lors de l'enregistrement du produit."
        )
      : executer(
          () => creerProduitApi(payload),
          'Produit créé',
          "Erreur lors de l'enregistrement du produit."
        );

  const changerDisponibilite = (produit) =>
    executer(
      () => changerDisponibiliteApi(produit.id),
      produit.estDispo ? `${produit.nom} est en rupture` : `${produit.nom} est de nouveau disponible`,
      'Erreur lors du changement de disponibilité.'
    );

  const supprimer = (produit) =>
    executer(
      () => supprimerProduitApi(produit.id),
      'Produit supprimé',
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
    charger,
    enregistrer,
    changerDisponibilite,
    supprimer,
  };
};