import { useCallback, useRef, useState } from 'react';

export const useConfirmation = () => {
  const [demande, setDemande] = useState(null);
  const resolveur = useRef(null);

  const confirmer = useCallback(
    (options) =>
      new Promise((resolve) => {
        // Une demande encore ouverte est considérée comme refusée
        resolveur.current?.(false);
        resolveur.current = resolve;
        setDemande(options);
      }),
    []
  );

  const repondre = useCallback((reponse) => {
    resolveur.current?.(reponse);
    resolveur.current = null;
    setDemande(null);
  }, []);

  return { confirmer, modaleProps: { demande, onRepondre: repondre } };
};