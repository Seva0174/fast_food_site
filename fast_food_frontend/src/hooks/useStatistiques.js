import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getCommandesParJourApi,
  getStatsGlobalesApi,
  getStatsParPeriodeApi,
  getVentesProduitsApi,
} from '@/api/statistiquesApi';
import { extraireMessageErreur } from '@/lib/erreurs';
import { periodePrecedente } from '@/lib/periode';

// Chargement des statistiques. La période est { debut, fin }, ou null pour la vue globale.
// Les trois blocs (cartes, top des ventes, graphique) reçoivent la même période ;
// avec une période, les chiffres de la période précédente (même durée) servent de comparaison.
// "donnees" garde le dernier résultat affiché pendant un nouveau chargement ou après une erreur.
export const useStatistiques = () => {
  const [donnees, setDonnees] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const periodeDemandee = useRef(null);
  // Numéro de la dernière requête lancée : une réponse plus ancienne est ignorée
  const derniereRequete = useRef(0);

  const charger = useCallback(async (periode = null) => {
    const numero = ++derniereRequete.current;
    periodeDemandee.current = periode;
    setChargement(true);
    setErreur('');
    const precedente = periode ? periodePrecedente(periode) : null;
    try {
      const [stats, topProduits, commandesParJour, statsPrecedentes] = await Promise.all([
        periode ? getStatsParPeriodeApi(periode.debut, periode.fin) : getStatsGlobalesApi(),
        getVentesProduitsApi(periode),
        getCommandesParJourApi(periode),
        // La comparaison est un plus : son échec ne bloque pas le reste
        precedente
          ? getStatsParPeriodeApi(precedente.debut, precedente.fin).catch(() => null)
          : null,
      ]);
      if (numero !== derniereRequete.current) return;
      setDonnees({
        periode,
        precedente: statsPrecedentes ? precedente : null,
        stats,
        statsPrecedentes,
        topProduits,
        commandesParJour,
      });
    } catch (err) {
      if (numero !== derniereRequete.current) return;
      console.error('Erreur lors de la récupération des statistiques :', err);
      setErreur(extraireMessageErreur(err) || 'Erreur lors de la récupération des données.');
    } finally {
      if (numero === derniereRequete.current) setChargement(false);
    }
  }, []);

  const recharger = useCallback(() => charger(periodeDemandee.current), [charger]);

  useEffect(() => {
    charger();
  }, [charger]);

  return { donnees, chargement, erreur, charger, recharger };
};
