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
import { construirePayloadProduitFormule, reordonnerEmplacements } from '@/lib/formule';
import { construirePayloadGroupe } from '@/lib/options';
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

  // Les formulaires valident leurs champs avant l'appel (erreursGroupe, erreurSurcout)
  const creerGroupe = (formulaire) =>
    executer(
      () => creerGroupeFormuleApi(idFormule, construirePayloadGroupe(formulaire)),
      'Emplacement créé',
      "Erreur lors de la création de l'emplacement."
    );

  const modifierGroupe = (idGroupe, formulaire) =>
    executer(
      () => modifierGroupeFormuleApi(idGroupe, construirePayloadGroupe(formulaire)),
      'Emplacement modifié',
      "Erreur lors de la modification de l'emplacement."
    );

  // Monte (sens -1) ou descend (sens 1) un emplacement ; les ordres sont renumérotés 1, 2, 3...
  const deplacerGroupe = (idGroupe, sens) => {
    const changements = reordonnerEmplacements(groupes, idGroupe, sens);
    if (changements.length === 0) return Promise.resolve(false);
    return executer(
      () =>
        Promise.all(
          changements.map(({ groupe, ordre }) =>
            modifierGroupeFormuleApi(groupe.id, {
              nom: groupe.nom,
              minSelection: groupe.minSelection,
              maxSelection: groupe.maxSelection,
              ordre,
            })
          )
        ),
      'Ordre des emplacements modifié',
      "Erreur lors du déplacement de l'emplacement."
    );
  };

  const supprimerGroupe = (idGroupe) =>
    executer(
      () => supprimerGroupeFormuleApi(idGroupe),
      'Emplacement supprimé',
      "Erreur lors de la suppression de l'emplacement."
    );

  const ajouterProduit = (idGroupe, formulaire) =>
    executer(
      () => ajouterProduitFormuleApi(idGroupe, construirePayloadProduitFormule(formulaire)),
      'Produit ajouté',
      "Erreur lors de l'ajout du produit."
    );

  const modifierSurcout = (idLien, saisie) =>
    executer(
      () => modifierSurcoutFormuleApi(idLien, { surcout: parseFloat(saisie || 0) }),
      'Surcoût modifié',
      'Erreur lors de la modification du surcoût.'
    );

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
    charger,
    creerGroupe,
    modifierGroupe,
    deplacerGroupe,
    supprimerGroupe,
    ajouterProduit,
    modifierSurcout,
    retirerProduit,
  };
};