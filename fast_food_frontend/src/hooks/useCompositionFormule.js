import { useCallback, useEffect, useState } from 'react';
import {
  ajouterProduitFormuleApi,
  creerGroupeFormuleApi,
  getGroupesFormuleApi,
  modifierGroupeFormuleApi,
  modifierSurcoutFormuleApi,
  retirerProduitFormuleApi,
  supprimerGroupeFormuleApi,
} from '@/api/formulesApi';
import { extraireMessageErreur } from '@/lib/erreurs';
import { construirePayloadProduitFormule, erreurSurcout } from '@/lib/formule';
import { construirePayloadGroupe, erreurGroupe } from '@/lib/options';
import { useMessage } from './useMessage';

// Emplacements d'un menu et produits proposés : chargement et modifications.
// onChange est appelé après chaque modification réussie (pour rafraîchir la carte).
export const useCompositionFormule = (idFormule, onChange) => {
  const [groupes, setGroupes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const { message, afficher } = useMessage();

  const charger = useCallback(async () => {
    try {
      setGroupes(await getGroupesFormuleApi(idFormule));
      setErreur('');
    } catch {
      setErreur('Impossible de charger la composition de ce menu.');
    } finally {
      setChargement(false);
    }
  }, [idFormule]);

  useEffect(() => {
    charger();
  }, [charger]);

  // Exécute une action puis recharge les emplacements. Renvoie true si l'action a réussi.
  const executer = useCallback(
    async (action, messageSucces, messageEchec) => {
      try {
        await action();
        afficher(messageSucces);
      } catch (err) {
        afficher(extraireMessageErreur(err) || messageEchec, 'erreur');
        return false;
      }
      await charger();
      if (onChange) onChange();
      return true;
    },
    [afficher, charger, onChange]
  );

  // Valide un formulaire d'emplacement : renvoie le corps de la requête, ou null.
  const preparerGroupe = (formulaire) => {
    const payload = construirePayloadGroupe(formulaire);
    const messageErreur = erreurGroupe(payload);
    if (messageErreur) {
      afficher(messageErreur, 'erreur');
      return null;
    }
    return payload;
  };

  const creerGroupe = async (formulaire) => {
    const payload = preparerGroupe(formulaire);
    if (!payload) return false;
    return executer(
      () => creerGroupeFormuleApi(idFormule, payload),
      'Emplacement créé',
      "Erreur lors de la création de l'emplacement."
    );
  };

  const modifierGroupe = async (idGroupe, formulaire) => {
    const payload = preparerGroupe(formulaire);
    if (!payload) return false;
    return executer(
      () => modifierGroupeFormuleApi(idGroupe, payload),
      'Emplacement modifié',
      "Erreur lors de la modification de l'emplacement."
    );
  };

  const supprimerGroupe = (idGroupe) =>
    executer(
      () => supprimerGroupeFormuleApi(idGroupe),
      'Emplacement supprimé',
      "Erreur lors de la suppression de l'emplacement."
    );

  const ajouterProduit = async (idGroupe, formulaire) => {
    if (!formulaire.idProduit) {
      afficher('Choisissez un produit.', 'erreur');
      return false;
    }
    const payload = construirePayloadProduitFormule(formulaire);
    const messageErreur = erreurSurcout(payload.surcout);
    if (messageErreur) {
      afficher(messageErreur, 'erreur');
      return false;
    }
    return executer(
      () => ajouterProduitFormuleApi(idGroupe, payload),
      'Produit ajouté',
      "Erreur lors de l'ajout du produit."
    );
  };

  const modifierSurcout = async (idLien, saisie) => {
    const surcout = parseFloat(saisie || 0);
    const messageErreur = erreurSurcout(surcout);
    if (messageErreur) {
      afficher(messageErreur, 'erreur');
      return false;
    }
    return executer(
      () => modifierSurcoutFormuleApi(idLien, { surcout }),
      'Surcoût modifié',
      'Erreur lors de la modification du surcoût.'
    );
  };

  const retirerProduit = (idLien) =>
    executer(
      () => retirerProduitFormuleApi(idLien),
      'Produit retiré',
      'Erreur lors du retrait du produit.'
    );

  return {
    groupes,
    chargement,
    erreur,
    message,
    creerGroupe,
    modifierGroupe,
    supprimerGroupe,
    ajouterProduit,
    modifierSurcout,
    retirerProduit,
  };
};