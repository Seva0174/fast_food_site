import { useCallback, useEffect, useRef, useState } from 'react';

// Message (succes, erreur ou avertissement) qui disparait tout seul apres un delai.
// Un message peut demander une duree plus longue (ex : liste d'articles non repris).
export const useMessage = (duree = 5000) => {
  const [message, setMessage] = useState(null);
  const minuterie = useRef(null);

  const afficher = useCallback(
    (texte, type = 'succes', dureeMessage = duree) => {
      clearTimeout(minuterie.current);
      setMessage({ texte, type });
      minuterie.current = setTimeout(() => setMessage(null), dureeMessage);
    },
    [duree]
  );

  // Évite une mise à jour d'état après le démontage du composant
  useEffect(() => () => clearTimeout(minuterie.current), []);

  return { message, afficher };
};