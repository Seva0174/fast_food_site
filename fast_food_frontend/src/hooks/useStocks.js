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
import { useExecuter } from './useExecuter';

// Chargement et modification des stocks de matières premières.
// chargement : premier chargement de la liste ; enCours : une action (ajout, modification...) attend le serveur.
export const useStocks = () => {
  const [stocks, setStocks] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [enCours, setEnCours] = useState(false);
  const { message, afficher } = useMessage();

  const charger = useCallback(async () => {
    try {
      setStocks(await getMatieresPremieresApi());
      setErreur('');
    } catch {
      setErreur('Impossible de charger les stocks.');
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  const executerBase = useExecuter(afficher, charger);

  // Exécute une action puis recharge la liste. Renvoie true si l'action a réussi.
  const executer = (action, messageSucces, messageEchec) =>
    executerBase(
      async () => {
        setEnCours(true);
        try {
          await action();
        } finally {
          setEnCours(false);
        }
      },
      messageSucces,
      messageEchec
    );

  const creer = async (donnees) => {
    const erreurSaisie = erreurNouveauStock(donnees);
    if (erreurSaisie) {
      afficher(erreurSaisie, 'erreur');
      return false;
    }
    return executer(
      () => creerMatierePremiereApi({ ...donnees, nom: donnees.nom.trim() }),
      'Matière première ajoutée',
      "Erreur lors de l'ajout de la matière première"
    );
  };

  const modifier = (id, donnees) => {
    if (Number.isNaN(donnees.quantite) || donnees.quantite < 0) {
      afficher('La quantité doit être un nombre positif ou nul', 'erreur');
      return false;
    }
    return executer(
      () => modifierStockApi(id, donnees),
      'Stock mis à jour',
      'Erreur lors de la mise à jour du stock'
    );
  };

  // Le serveur refuse (400 ou 409) une matière première liée à une recette ou à une commande fournisseur :
  // le message nomme l'ingrédient et propose une autre voie. Renvoie true si elle a été supprimée.
  const supprimer = async (stock) => {
    setEnCours(true);
    try {
      await supprimerMatierePremiereApi(stock.id);
      afficher(`« ${stock.nom} » supprimée`);
      await charger();
      return true;
    } catch (err) {
      const refus = [400, 409].includes(err?.response?.status);
      afficher(
        refus
          ? `« ${stock.nom} » est utilisée dans une recette ou une commande fournisseur : elle ne peut pas être supprimée. Mets sa quantité à 0 si tu ne l'utilises plus.`
          : extraireMessageErreur(err) || 'Erreur lors de la suppression de la matière première',
        'erreur',
        8000
      );
      return false;
    } finally {
      setEnCours(false);
    }
  };

  return { stocks, chargement, erreur, enCours, message, charger, creer, modifier, supprimer };
};
