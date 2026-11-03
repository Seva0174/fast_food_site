import { useCallback, useRef, useState } from 'react';

// Action en cours d'envoi (enregistrement, suppression...) : `enCours` désactive le bouton
// et un second clic pendant l'envoi est ignoré. `lancer` renvoie le résultat de l'action.
export const useEnvoi = () => {
  const [enCours, setEnCours] = useState(false);
  const verrou = useRef(false);

  const lancer = useCallback(async (action) => {
    if (verrou.current) return false;
    verrou.current = true;
    setEnCours(true);
    try {
      return await action();
    } finally {
      verrou.current = false;
      setEnCours(false);
    }
  }, []);

  return { enCours, lancer };
};
