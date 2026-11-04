import { useEffect, useRef } from 'react';

// Encart qui s'ouvre à la place de son bouton (formulaire d'ajout, import...) : à sa fermeture,
// le focus revient au bouton qui l'a ouvert, au lieu de retomber au début de la page.
// Renvoie la ref à poser sur ce bouton.
export const useRetourFocus = (ouvert) => {
  const declencheur = useRef(null);
  const etaitOuvert = useRef(false);

  useEffect(() => {
    if (ouvert) {
      etaitOuvert.current = true;
      return;
    }
    if (!etaitOuvert.current) return;
    etaitOuvert.current = false;
    declencheur.current?.focus();
  }, [ouvert]);

  return declencheur;
};
