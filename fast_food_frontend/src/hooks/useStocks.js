import { useCallback, useEffect, useState } from 'react';
import {
  creerMatierePremiereApi,
  getMatieresPremieresApi,
  modifierStockApi,
  supprimerMatierePremiereApi,
} from '@/api/stockApi';
import { extraireMessageErreur } from '@/lib/erreurs';
import { erreurNouveauStock } from '@/lib/stock';
import { useMessage } from './useMessage';

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

  // Exécute une action puis recharge la liste. Renvoie true si l'action a réussi.
  const executer = useCallback(
    async (action, messageSucces, messageEchec) => {
      setChargement(true);
      try {
        await action();
        afficher(messageSucces);
      } catch (err) {
        afficher(extraireMessageErreur(err) || messageEchec, 'erreur');
        return false;
      } finally {
        setChargement(false);
      }
      await charger();
      return true;
    },
    [afficher, charger]
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