import { useCallback, useEffect, useRef, useState } from 'react';

// Message de succès ou d'erreur qui disparaît tout seul après un délai.
export const useMessage = (duree = 5000) => {
  const [message, setMessage] = useState(null);
  const minuterie = useRef(null);

  const afficher = useCallback(
    (texte, type = 'succes') => {
      clearTimeout(minuterie.current);
      setMessage({ texte, type });
      minuterie.current = setTimeout(() => setMessage(null), duree);
    },
    [duree]
  );

  // Évite une mise à jour d'état après le démontage du composant
  useEffect(() => () => clearTimeout(minuterie.current), []);

  return { message, afficher };
};