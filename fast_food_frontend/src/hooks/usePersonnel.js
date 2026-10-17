import { useCallback, useEffect, useState } from 'react';
import {
  creerEmployeApi,
  getEmployesApi,
  modifierEmployeApi,
  supprimerEmployeApi,
} from '@/api/personnelApi';
import { extraireMessageErreur } from '@/lib/erreurs';
import { useMessage } from './useMessage';

// Liste des employés, création, modification et suppression.
// `afficher` est exposé pour partager le même bandeau avec les heures et la fiche de paie.
export const usePersonnel = () => {
  const [employes, setEmployes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const { message, afficher } = useMessage();

  const charger = useCallback(async () => {
    try {
      setEmployes(await getEmployesApi());
      setErreur('');
    } catch {
      setErreur('Erreur lors du chargement des employés.');
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  // Exécute une action puis recharge la liste. Renvoie true si l'action a réussi.
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
      return true;
    },
    [afficher, charger]
  );

  const creer = (donnees) =>
    executer(() => creerEmployeApi(donnees), 'Employé créé avec succès', 'Erreur lors de la création');

  const modifier = (id, donnees) =>
    executer(
      () => modifierEmployeApi(id, donnees),
      'Employé modifié avec succès',
      'Erreur lors de la modification'
    );

  const supprimer = (id) =>
    executer(() => supprimerEmployeApi(id), 'Employé supprimé', 'Erreur lors de la suppression.');

  return { employes, chargement, erreur, message, afficher, creer, modifier, supprimer };
};