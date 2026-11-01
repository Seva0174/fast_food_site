import { useCallback, useEffect, useRef, useState } from 'react';
import { DECALAGE_CARTE, defilerVers } from '../lib/defilement';

// Suit la section de la carte visible sous la barre des categories ("scroll-spy").
// ids : identifiants HTML des sections, dans l'ordre de la page.
// Renvoie la section active et une fonction pour y aller au clic.
export const useSectionActive = (ids) => {
  const [active, setActive] = useState(null);
  // Pendant un defilement lance par un clic, la pastille choisie reste active
  // au lieu de passer par toutes les sections traversees.
  const verrou = useRef(false);
  const cle = ids.join('|');

  useEffect(() => {
    if (ids.length === 0) return undefined;
    let image = null;

    const calculer = () => {
      image = null;
      if (verrou.current) return;
      const enBas = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (enBas) {
        setActive(ids[ids.length - 1]);
        return;
      }
      // Derniere section dont le haut est passe sous la barre des categories
      let courante = ids[0];
      for (const id of ids) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= DECALAGE_CARTE + 1) courante = id;
      }
      setActive(courante);
    };

    const surDefilement = () => {
      if (image === null) image = requestAnimationFrame(calculer);
    };

    calculer();
    window.addEventListener('scroll', surDefilement, { passive: true });
    window.addEventListener('resize', surDefilement);
    return () => {
      window.removeEventListener('scroll', surDefilement);
      window.removeEventListener('resize', surDefilement);
      if (image !== null) cancelAnimationFrame(image);
    };
    // cle resume ids : evite de relancer l'effet a chaque rendu
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle]);

  const allerA = useCallback((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    setActive(id);
    verrou.current = true;
    const liberer = () => {
      verrou.current = false;
    };
    window.addEventListener('scrollend', liberer, { once: true });
    // Filet de securite si scrollend n'est pas emis (deja a la bonne position, navigateur ancien)
    setTimeout(liberer, 1200);
    defilerVers(element);
    // Le focus clavier suit le defilement : Tab continue dans la section choisie
    document.getElementById(`titre-${id}`)?.focus({ preventScroll: true });
  }, []);

  return { active, allerA };
};
