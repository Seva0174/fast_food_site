import { useRef, useState } from 'react';
import { getSalaireMensuelApi } from '@/api/personnelApi';
import { extraireMessageErreur } from '@/lib/erreurs';

// Fiche de paie mensuelle d'un employé. Une réponse arrivée après une réinitialisation est ignorée.
export const useFichePaie = (idEmploye, afficher) => {
  const [fiche, setFiche] = useState(null);
  const derniereRequete = useRef(0);

  const calculer = async (annee, mois) => {
    const numero = ++derniereRequete.current;
    try {
      const resultat = await getSalaireMensuelApi(idEmploye, annee, mois);
      if (numero === derniereRequete.current) setFiche(resultat);
    } catch (err) {
      afficher(extraireMessageErreur(err) || 'Erreur lors du calcul du salaire.', 'erreur');
    }
  };

  const reinitialiser = () => {
    derniereRequete.current += 1;
    setFiche(null);
  };

  return { fiche, calculer, reinitialiser };
};