import { useCallback, useEffect, useState } from 'react';
import {
  ajouterHeuresApi,
  getHeuresApi,
  getHeuresPeriodeApi,
  supprimerHeureApi,
} from '@/api/personnelApi';
import { extraireMessageErreur } from '@/lib/erreurs';
import { erreurSaisieHeures, heuresEnDecimal } from '@/lib/personnel';
import { erreurPeriode } from '@/lib/periode';

// Heures d'un employé : consultation (avec filtre par période), saisie et suppression.
export const useHeuresEmploye = (idEmploye, afficher) => {
  const [heures, setHeures] = useState([]);
  // Filtre actif { debut, fin }, ou null pour toutes les heures
  const [periode, setPeriode] = useState(null);

  const charger = useCallback(
    async (filtre) => {
      try {
        setHeures(
          filtre
            ? await getHeuresPeriodeApi(idEmploye, filtre.debut, filtre.fin)
            : await getHeuresApi(idEmploye)
        );
      } catch (err) {
        setHeures([]);
        afficher(extraireMessageErreur(err) || 'Erreur lors de la récupération des heures.', 'erreur');
      }
    },
    [idEmploye, afficher]
  );

  useEffect(() => {
    charger(null);
  }, [charger]);

  const filtrer = async (debut, fin) => {
    const erreur = erreurPeriode(debut, fin);
    if (erreur) {
      afficher(erreur, 'erreur');
      return;
    }
    const filtre = { debut, fin };
    setPeriode(filtre);
    await charger(filtre);
  };

  const reinitialiserFiltre = async () => {
    setPeriode(null);
    await charger(null);
  };

  // Renvoie true si la saisie a été enregistrée.
  const ajouter = async (date, saisieHeures, saisieMinutes) => {
    const total = heuresEnDecimal(saisieHeures, saisieMinutes);
    const erreur = erreurSaisieHeures(total);
    if (erreur) {
      afficher(erreur, 'erreur');
      return false;
    }

    try {
      await ajouterHeuresApi({ employeId: idEmploye, date, nbHeure: Number(total.toFixed(4)) });
    } catch (err) {
      afficher(extraireMessageErreur(err) || 'Erreur de saisie', 'erreur');
      return false;
    }
    // La liste reste cohérente avec le filtre en cours
    await charger(periode);
    return true;
  };

  const supprimer = async (idHeure) => {
    try {
      await supprimerHeureApi(idHeure);
      setHeures((prev) => prev.filter((h) => h.id !== idHeure));
    } catch (err) {
      afficher(extraireMessageErreur(err) || "Erreur lors de la suppression de l'heure.", 'erreur');
    }
  };

  return { heures, periode, filtrer, reinitialiserFiltre, ajouter, supprimer };
};