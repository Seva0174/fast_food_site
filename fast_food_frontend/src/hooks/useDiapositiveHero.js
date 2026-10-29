import { useCallback, useEffect, useRef } from 'react';

const DUREE_MS = 800;          // duree d'un glissement complet
const DUREE_MIN_MS = 300;      // duree minimale d'un glissement court
const DUREE_PRESSE_MS = 160;   // duree de fin de glissement quand l'utilisateur insiste
const DELAI_GRACE_MS = 200;    // avant ce delai, la molette est consideree comme l'elan du geste initial
const SEUIL_INTENTION = 40;    // amplitude minimale d'un cran de molette considere comme volontaire

const courbes = {
  // Accelere puis ralentit : mouvement de diapositive
  entreeSortie: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  // Demarre vite puis ralentit : sert a terminer un glissement deja en cours
  sortie: (t) => 1 - Math.pow(1 - t, 3),
};

const mouvementReduit = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Un conteneur interne (ex : liste du panier) peut-il encore defiler dans ce sens ?
const peutDefilerDedans = (element, dy) => {
  for (let el = element; el && el !== document.body; el = el.parentElement) {
    const { overflowY } = getComputedStyle(el);
    const defilable = overflowY === 'auto' || overflowY === 'scroll';
    if (defilable && el.scrollHeight > el.clientHeight + 1) {
      if (dy < 0 && el.scrollTop > 0) return true;
      if (dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
    }
  }
  return false;
};

const dansUneModale = () => document.querySelector('[role="dialog"]') !== null;

const enSaisie = (el) =>
  Boolean(el) && (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.isContentEditable);

// Comportement "diapositive" de la banniere (bureau uniquement) :
// - un coup de molette vers le bas fait glisser la banniere hors de l'ecran
//   et amene le debut de la liste des produits ;
// - un coup de molette vers le haut, depuis le debut de la liste, ramene la banniere.
// Hors de la banniere, le defilement reste normal.
//
// Le glissement ne bloque jamais l'utilisateur pressé :
// - s'il insiste dans le meme sens, le glissement se termine presque aussitot
//   et le defilement normal reprend ;
// - s'il change de sens, le glissement repart tout de suite dans l'autre sens ;
// - il n'y a aucun delai d'attente apres un glissement.
export const useDiapositiveHero = (actif) => {
  const refHero = useRef(null);
  const etat = useRef({
    enCours: false,
    sens: 0,            // 1 = vers la liste, -1 = vers la banniere
    cible: 0,
    debutLancement: 0,  // instant du dernier geste volontaire
    compresse: false,   // le glissement a deja ete accelere
    image: 0,
  });

  const lancer = useCallback((cible, { courbe = 'entreeSortie', duree, compression = false } = {}) => {
    const s = etat.current;
    cancelAnimationFrame(s.image);

    const depart = window.scrollY;
    const distance = cible - depart;

    if (Math.abs(distance) < 1) {
      s.enCours = false;
      return;
    }

    const hauteur = refHero.current?.offsetHeight || 1;
    const dureeTotale =
      duree ?? Math.min(DUREE_MS, Math.max(DUREE_MIN_MS, (DUREE_MS * Math.abs(distance)) / hauteur));
    const debut = performance.now();

    s.enCours = true;
    s.sens = Math.sign(distance);
    s.cible = cible;
    if (!compression) {
      s.debutLancement = debut;
      s.compresse = false;
    }

    const pas = (maintenant) => {
      const progression = Math.min((maintenant - debut) / dureeTotale, 1);
      window.scrollTo({ top: depart + distance * courbes[courbe](progression), behavior: 'instant' });

      if (progression < 1) {
        s.image = requestAnimationFrame(pas);
      } else {
        s.enCours = false;
      }
    };

    s.image = requestAnimationFrame(pas);
  }, []);

  // Termine le glissement en cours rapidement, depuis la position actuelle
  const accelerer = useCallback(() => {
    const s = etat.current;
    s.compresse = true;
    lancer(s.cible, { courbe: 'sortie', duree: DUREE_PRESSE_MS, compression: true });
  }, [lancer]);

  useEffect(() => {
    if (!actif || mouvementReduit()) return undefined;

    const s = etat.current;
    const hauteurHero = () => refHero.current?.offsetHeight ?? 0;

    const surRoulette = (e) => {
      if (e.ctrlKey || dansUneModale()) return;

      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      if (Math.abs(dy) < Math.abs(e.deltaX)) return;

      const h = hauteurHero();

      // Glissement en cours : on ne bloque pas, on s'adapte a l'utilisateur
      if (s.enCours) {
        e.preventDefault();
        if (Math.abs(dy) < 4) return;

        const sens = dy > 0 ? 1 : -1;
        if (sens !== s.sens) {
          lancer(sens > 0 ? h : 0);
        } else if (
          !s.compresse &&
          Math.abs(dy) >= SEUIL_INTENTION &&
          performance.now() - s.debutLancement > DELAI_GRACE_MS
        ) {
          accelerer();
        }
        return;
      }

      const y = window.scrollY;
      const dansHero = y < h - 1;
      const remonteVersHero = dy < 0 && y + dy <= h;

      if (!dansHero && !remonteVersHero) return; // defilement normal
      if (peutDefilerDedans(e.target, dy)) return;

      e.preventDefault();
      if (Math.abs(dy) < 4) return;

      lancer(dy > 0 ? h : 0);
    };

    const surTouche = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || enSaisie(e.target) || dansUneModale()) return;

      const bas = e.key === 'ArrowDown' || e.key === 'PageDown';
      const haut = e.key === 'ArrowUp' || e.key === 'PageUp';
      if (!bas && !haut) return;

      const h = hauteurHero();
      const sens = bas ? 1 : -1;

      if (s.enCours) {
        e.preventDefault();
        if (sens !== s.sens) {
          lancer(sens > 0 ? h : 0);
        } else if (e.repeat && !s.compresse) {
          accelerer(); // touche maintenue : l'utilisateur est presse
        }
        return;
      }

      const y = window.scrollY;
      const dansHero = y < h - 1;

      if (bas && dansHero) {
        e.preventDefault();
        lancer(h);
      } else if (haut && y <= h + 1) {
        e.preventDefault();
        lancer(0);
      }
    };

    window.addEventListener('wheel', surRoulette, { passive: false });
    window.addEventListener('keydown', surTouche);

    return () => {
      window.removeEventListener('wheel', surRoulette);
      window.removeEventListener('keydown', surTouche);
      cancelAnimationFrame(s.image);
      s.enCours = false;
    };
  }, [actif, lancer, accelerer]);

  // Bouton "Commander" : meme glissement sur bureau, defilement simple sinon
  const descendre = useCallback(() => {
    const hero = refHero.current;
    if (actif && hero && !mouvementReduit()) {
      lancer(hero.offsetHeight);
    } else {
      document.getElementById('carte')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [actif, lancer]);

  return { refHero, descendre };
};