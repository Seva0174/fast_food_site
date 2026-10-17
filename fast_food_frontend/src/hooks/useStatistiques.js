import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getCommandesParJourApi,
  getStatsGlobalesApi,
  getStatsParPeriodeApi,
  getVentesProduitsApi,
} from '@/api/statistiquesApi';
import { extraireMessageErreur } from '@/lib/erreurs';

// Chargement des statistiques. La période est { debut, fin }, ou null pour la vue globale.
// Les trois blocs (cartes, top des ventes, graphique) reçoivent la même période.
export const useStatistiques = () => {
  const [stats, setStats] = useState(null);
  const [topProduits, setTopProduits] = useState([]);
  const [commandesParJour, setCommandesParJour] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  // Numéro de la dernière requête lancée : une réponse plus ancienne est ignorée
  const derniereRequete = useRef(0);

  const charger = useCallback(async (periode = null) => {
    const numero = ++derniereRequete.current;
    setChargement(true);
    setErreur('');
    try {
      const [resStats, resTop, resJours] = await Promise.all([
        periode ? getStatsParPeriodeApi(periode.debut, periode.fin) : getStatsGlobalesApi(),
        getVentesProduitsApi(periode),
        getCommandesParJourApi(periode),
      ]);
      if (numero !== derniereRequete.current) return;
      setStats(resStats);
      setTopProduits(resTop);
      setCommandesParJour(resJours);
    } catch (err) {
      if (numero !== derniereRequete.current) return;
      console.error('Erreur lors de la récupération des statistiques :', err);
      setErreur(extraireMessageErreur(err) || 'Erreur lors de la récupération des données.');
    } finally {
      if (numero === derniereRequete.current) setChargement(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  return { stats, topProduits, commandesParJour, chargement, erreur, charger };
};