import { useEffect, useRef } from 'react';
import { idSectionCategorie, mouvementReduit } from '../../lib/defilement';

// Barre collante sous la navbar (h-16). Chaque pastille mene a sa section de la carte ;
// la pastille de la section visible est mise en avant (voir useSectionActive).
export const FiltresCategories = ({ categories, sectionActive, onChoisir }) => {
  const refBarre = useRef(null);

  // Sur mobile, la pastille active reste visible dans la barre qui defile horizontalement
  useEffect(() => {
    const barre = refBarre.current;
    const pastille = barre?.querySelector('[aria-current="location"]');
    if (!barre || !pastille) return;
    const gauche = pastille.offsetLeft - (barre.clientWidth - pastille.offsetWidth) / 2;
    barre.scrollTo({ left: gauche, behavior: mouvementReduit() ? 'auto' : 'smooth' });
  }, [sectionActive]);

  return (
    <nav
      id="carte"
      aria-label="Catégories de la carte"
      className="sticky top-16 z-30 scroll-mt-16 border-b border-border bg-background/95 py-3 backdrop-blur"
    >
      <div ref={refBarre} className="flex gap-2 overflow-x-auto scrollbar-none">
        {categories.map((cat) => {
          const id = idSectionCategorie(cat.id);
          const actif = sectionActive === id;
          return (
            <a
              key={cat.id}
              href={`#${id}`}
              aria-current={actif ? 'location' : undefined}
              onClick={(e) => {
                e.preventDefault();
                onChoisir(id);
              }}
              className={`inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors sm:px-5 ${
                actif
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'border-border bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              {cat.nom}
            </a>
          );
        })}
      </div>
    </nav>
  );
};
