import { useEffect, useRef, useState } from 'react';

const reduireMouvement = () =>
  typeof window === 'undefined' ||
  !('IntersectionObserver' in window) ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Renvoie [ref, visible]. "visible" passe a true (une seule fois) quand l'element
// entre dans la fenetre. Sans animation possible, il est visible d'emblee.
export const useApparition = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(reduireMouvement);

  useEffect(() => {
    const element = ref.current;
    if (visible || !element) return undefined;

    const observateur = new IntersectionObserver(
      ([entree]) => {
        if (entree.isIntersecting) {
          setVisible(true);
          observateur.disconnect();
        }
      },
      { threshold: 0, rootMargin: '0px 0px -8% 0px' }
    );

    observateur.observe(element);
    return () => observateur.disconnect();
  }, [visible]);

  return [ref, visible];
};