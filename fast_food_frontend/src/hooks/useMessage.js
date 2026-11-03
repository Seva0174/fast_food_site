import { useCallback, useEffect, useRef, useState } from 'react';

// Message (succes, erreur ou avertissement) qui disparait tout seul apres un delai.
// Un message peut demander une duree plus longue (ex : liste d'articles non repris).
export const useMessage = (duree = 5000) => {
  const [message, setMessage] = useState(null);
  const minuterie = useRef(null);

  const afficher = useCallback(
    // action : { libelle, onClick } affiche un bouton dans le message (ex : « Annuler »), qui reste plus longtemps
    (texte, type = 'succes', dureeMessage, action = null) => {
      clearTimeout(minuterie.current);
      setMessage({ texte, type, action });
      minuterie.current = setTimeout(() => setMessage(null), dureeMessage ?? (action ? 8000 : duree));
    },
    [duree]
  );

  const effacer = useCallback(() => {
    clearTimeout(minuterie.current);
    setMessage(null);
  }, []);

  // Évite une mise à jour d'état après le démontage du composant
  useEffect(() => () => clearTimeout(minuterie.current), []);

  return { message, afficher, effacer };
};