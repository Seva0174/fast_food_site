import { useCallback, useEffect, useState } from 'react';
import {
  creerMatierePremiereApi,
  getMatieresPremieresApi,
  modifierStockApi,
  supprimerMatierePremiereApi,
} from '@/api/stockApi';
import { erreurNouveauStock } from '@/lib/stock';
import { useMessage } from './useMessage';
import { useExecuter } from './useExecuter';

// Chargement et modification des stocks de matières premières.
export const useStocks = () => {
  const [stocks, setStocks] = useState([]);
  const [chargement, setChargement] = useState(false);
  const { message, afficher } = useMessage();

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      setStocks(await getMatieresPremieresApi());
    } catch {
      afficher('Erreur lors du chargement des stocks', 'erreur');
    } finally {
      setChargement(false);
    }
  }, [afficher]);

  useEffect(() => {
    charger();
  }, [charger]);

  const executerBase = useExecuter(afficher, charger);

  // Exécute une action puis recharge la liste. Renvoie true si l'action a réussi.
 const executer = (action, messageSucces, messageEchec) =>
    executerBase(
      async () => {
        setChargement(true);
        try {
          await action();
        } finally {
          setChargement(false);
        }
      },
      messageSucces,
      messageEchec
    );

  const creer = async (donnees) => {
    const erreur = erreurNouveauStock(donnees);
    if (erreur) {
      afficher(erreur, 'erreur');
      return false;
    }
    return executer(
      () => creerMatierePremiereApi({ ...donnees, nom: donnees.nom.trim() }),
      'Matière première ajoutée avec succès',
      'Erreur lors de la création de la matière première'
    );
  };

  const modifier = (id, donnees) =>
    executer(
      () => modifierStockApi(id, donnees),
      'Stock mis à jour avec succès',
      'Erreur lors de la mise à jour du stock'
    );

  const supprimer = (id) =>
    executer(
      () => supprimerMatierePremiereApi(id),
      'Matière première supprimée',
      'Impossible de supprimer cette matière première (utilisée dans une recette ou commande).'
    );

  return { stocks, chargement, message, charger, creer, modifier, supprimer };
};