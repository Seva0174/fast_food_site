import { useCallback, useEffect, useState } from 'react';
import {
  creerGroupeOptionApi,
  creerOptionApi,
  getGroupesOptionsApi,
  modifierGroupeOptionApi,
  modifierOptionApi,
  supprimerGroupeOptionApi,
  supprimerOptionApi,
} from '@/api/optionsApi';
import { extraireMessageErreur } from '@/lib/erreurs';
import {
  construirePayloadGroupe,
  construirePayloadOption,
  erreurGroupe,
  erreurOption,
} from '@/lib/options';
import { useMessage } from './useMessage';

// Groupes d'options d'un produit et leurs options : chargement et modifications.
// onChange est appelé après chaque modification réussie (pour rafraîchir la carte).
export const useOptionsProduit = (idProduit, onChange) => {
  const [groupes, setGroupes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const { message, afficher } = useMessage();

  const charger = useCallback(async () => {
    try {
      setGroupes(await getGroupesOptionsApi(idProduit));
      setErreur('');
    } catch {
      setErreur('Impossible de charger les options de ce produit.');
    } finally {
      setChargement(false);
    }
  }, [idProduit]);

  useEffect(() => {
    charger();
  }, [charger]);

  // Exécute une action puis recharge les groupes. Renvoie true si l'action a réussi.
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

  // Valide le contenu d'un formulaire avant l'appel : renvoie le corps de la requête, ou null.
  const preparerGroupe = (formulaire) => {
    const payload = construirePayloadGroupe(formulaire);
    const messageErreur = erreurGroupe(payload);
    if (messageErreur) {
      afficher(messageErreur, 'erreur');
      return null;
    }
    return payload;
  };

  const preparerOption = (formulaire) => {
    const payload = construirePayloadOption(formulaire);
    const messageErreur = erreurOption(payload);
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
      () => creerGroupeOptionApi(idProduit, payload),
      'Groupe créé',
      'Erreur lors de la création du groupe.'
    );
  };

  const modifierGroupe = async (idGroupe, formulaire) => {
    const payload = preparerGroupe(formulaire);
    if (!payload) return false;
    return executer(
      () => modifierGroupeOptionApi(idGroupe, payload),
      'Groupe modifié',
      'Erreur lors de la modification du groupe.'
    );
  };

  const supprimerGroupe = (idGroupe) =>
    executer(
      () => supprimerGroupeOptionApi(idGroupe),
      'Groupe supprimé',
      'Erreur lors de la suppression du groupe.'
    );

  const creerOption = async (idGroupe, formulaire) => {
    const payload = preparerOption(formulaire);
    if (!payload) return false;
    return executer(
      () => creerOptionApi(idGroupe, payload),
      'Option ajoutée',
      "Erreur lors de l'ajout de l'option."
    );
  };

  const modifierOption = async (idOption, formulaire) => {
    const payload = preparerOption(formulaire);
    if (!payload) return false;
    return executer(
      () => modifierOptionApi(idOption, payload),
      'Option modifiée',
      "Erreur lors de la modification de l'option."
    );
  };

  const supprimerOption = (idOption) =>
    executer(
      () => supprimerOptionApi(idOption),
      'Option supprimée',
      "Erreur lors de la suppression de l'option."
    );

  return {
    groupes,
    chargement,
    erreur,
    message,
    creerGroupe,
    modifierGroupe,
    supprimerGroupe,
    creerOption,
    modifierOption,
    supprimerOption,
  };
};