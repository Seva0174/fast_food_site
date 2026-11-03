import { useCallback, useEffect, useState } from 'react';
import { ajouterHeuresApi, getHeuresPeriodeApi, supprimerHeureApi } from '@/api/personnelApi';
import { extraireMessageErreur } from '@/lib/erreurs';
import { erreurSaisieHeures, heuresEnDecimal } from '@/lib/personnel';

// Heures d'un employé sur une période { debut, fin } : consultation, saisie et suppression.
// Les erreurs de saisie sont renvoyées à l'appelant (affichées sous le formulaire) ;
// les autres passent par `afficher`.
export const useHeuresEmploye = (idEmploye, periode, afficher) => {
  const [heures, setHeures] = useState([]);
  const [chargement, setChargement] = useState(true);
  const { debut, fin } = periode;

  const charger = useCallback(async () => {
    try {
      setHeures(await getHeuresPeriodeApi(idEmploye, debut, fin));
    } catch (err) {
      setHeures([]);
      afficher(extraireMessageErreur(err) || 'Erreur lors de la récupération des heures.', 'erreur');
    } finally {
      setChargement(false);
    }
  }, [idEmploye, debut, fin, afficher]);

  useEffect(() => {
    charger();
  }, [charger]);

  // Renvoie { saisie } si elle a été enregistrée, sinon { erreur }.
  const ajouter = useCallback(async (date, saisieHeures, saisieMinutes) => {
    const total = heuresEnDecimal(saisieHeures, saisieMinutes);
    const erreur = erreurSaisieHeures(total);
    if (erreur) return { erreur };

    try {
      const saisie = await ajouterHeuresApi({ employeId: idEmploye, date, nbHeure: Number(total.toFixed(4)) });
      await charger();
      return { saisie };
    } catch (err) {
      return { erreur: extraireMessageErreur(err) || "L'enregistrement a échoué. Réessayez." };
    }
  }, [idEmploye, charger]);

  // Renvoie true si la saisie a été supprimée.
  const supprimer = useCallback(async (idHeure) => {
    try {
      await supprimerHeureApi(idHeure);
      setHeures((prev) => prev.filter((h) => h.id !== idHeure));
      afficher('Saisie supprimée');
      return true;
    } catch (err) {
      afficher(extraireMessageErreur(err) || "Erreur lors de la suppression de l'heure.", 'erreur');
      return false;
    }
  }, [afficher]);

  return { heures, chargement, ajouter, supprimer };
};
