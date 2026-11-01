import { useCallback, useEffect, useRef, useState } from 'react';
import { getMesCommandesApi } from '../api/commandeApi';

const MESSAGE_ERREUR = 'Impossible de charger vos commandes.';

// Commandes du client connecte : chargement, erreur et rechargement manuel (voir useCommandesAdmin).
export const useMesCommandes = () => {
  const [commandes, setCommandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const monte = useRef(true);

  const appliquer = useCallback((promesse) => {
    promesse
      .then((data) => {
        if (monte.current) setCommandes(data);
      })
      .catch((e) => {
        console.error('Erreur lors de la récupération des commandes :', e);
        if (monte.current) setErreur(MESSAGE_ERREUR);
      })
      .finally(() => {
        if (monte.current) setChargement(false);
      });
  }, []);

  // Rechargement manuel (bouton "Réessayer")
  const charger = useCallback(() => {
    setChargement(true);
    setErreur('');
    appliquer(getMesCommandesApi());
  }, [appliquer]);

  useEffect(() => {
    monte.current = true;
    appliquer(getMesCommandesApi());
    return () => {
      monte.current = false;
    };
  }, [appliquer]);

  return { commandes, chargement, erreur, charger };
};
