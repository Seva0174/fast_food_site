import { useCallback } from 'react';
import { extraireMessageErreur } from '@/lib/erreurs';

// Exécute une action d'API : message de succès ou d'erreur, puis `apresSucces` (rechargement).
export const useExecuter = (afficher, apresSucces) =>
  useCallback(
    async (action, messageSucces, messageEchec) => {
      try {
        await action();
        afficher(messageSucces);
      } catch (err) {
        afficher(extraireMessageErreur(err) || messageEchec, 'erreur');
        return false;
      }
      await apresSucces();
      return true;
    },
    [afficher, apresSucces]
  );