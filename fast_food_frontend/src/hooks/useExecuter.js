import { useCallback } from 'react';
import { extraireMessageErreur } from '@/lib/erreurs';

// Exécute une action d'API : message de succès ou d'erreur, puis `apresSucces` (rechargement).
// messageSucces : un texte, ou { texte, action: { libelle, onClick }, duree } pour proposer une action (annuler).
// Renvoie le résultat de l'action (ex : le produit créé) s'il y en a un, sinon true ; false en cas d'échec.
export const useExecuter = (afficher, apresSucces) =>
  useCallback(
    async (action, messageSucces, messageEchec) => {
      let resultat;
      try {
        resultat = await action();
        const succes = typeof messageSucces === 'string' ? { texte: messageSucces } : messageSucces;
        afficher(succes.texte, 'succes', succes.duree, succes.action);
      } catch (err) {
        afficher(extraireMessageErreur(err) || messageEchec, 'erreur');
        return false;
      }
      await apresSucces();
      return resultat || true;
    },
    [afficher, apresSucces]
  );