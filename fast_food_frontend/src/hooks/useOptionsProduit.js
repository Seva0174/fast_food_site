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
import { useExecuter } from './useExecuter';
import { construirePayloadGroupe, construirePayloadOption } from '@/lib/options';
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

  const apresSucces = useCallback(async () => {
    await charger();
    if (onChange) onChange();
  }, [charger, onChange]);

  const executer = useExecuter(afficher, apresSucces);

  // Les formulaires valident leurs champs avant l'appel (erreursGroupe, erreursOption)
  const creerGroupe = (formulaire) =>
    executer(
      () => creerGroupeOptionApi(idProduit, construirePayloadGroupe(formulaire)),
      'Groupe créé',
      'Erreur lors de la création du groupe.'
    );

  const modifierGroupe = (idGroupe, formulaire) =>
    executer(
      () => modifierGroupeOptionApi(idGroupe, construirePayloadGroupe(formulaire)),
      'Groupe modifié',
      'Erreur lors de la modification du groupe.'
    );

  const supprimerGroupe = (idGroupe) =>
    executer(
      () => supprimerGroupeOptionApi(idGroupe),
      'Groupe supprimé',
      'Erreur lors de la suppression du groupe.'
    );

  const creerOption = (idGroupe, formulaire) =>
    executer(
      () => creerOptionApi(idGroupe, construirePayloadOption(formulaire)),
      'Option ajoutée',
      "Erreur lors de l'ajout de l'option."
    );

  const modifierOption = (idOption, formulaire) =>
    executer(
      () => modifierOptionApi(idOption, construirePayloadOption(formulaire)),
      'Option modifiée',
      "Erreur lors de la modification de l'option."
    );

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
    charger,
    creerGroupe,
    modifierGroupe,
    supprimerGroupe,
    creerOption,
    modifierOption,
    supprimerOption,
  };
};