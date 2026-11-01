// Hauteur occupee en haut de l'ecran par la navbar (64px) et la barre des categories collante.
// Les sections de la carte s'arretent juste en dessous (voir scroll-mt dans SectionCategorie).
export const DECALAGE_CARTE = 140;

export const idSectionCategorie = (idCategorie) => `categorie-${idCategorie}`;

export const mouvementReduit = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Defile jusqu'a un element ; instantane si l'utilisateur a demande moins d'animations.
export const defilerVers = (element) =>
  element?.scrollIntoView({ behavior: mouvementReduit() ? 'auto' : 'smooth', block: 'start' });
