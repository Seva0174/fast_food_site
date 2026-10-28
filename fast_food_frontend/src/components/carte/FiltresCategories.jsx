import { Bouton } from '../ui/bouton';

// Filtre en forme de pastille : actif en orange, inactif en anthracite
const Filtre = ({ actif, onClick, children }) => (
  <Bouton
    variante={actif ? 'principal' : 'secondaire'}
    taille="sm"
    className="whitespace-nowrap rounded-full px-4 py-2.5 sm:px-5"
    aria-pressed={actif}
    onClick={onClick}
  >
    {children}
  </Bouton>
);

// Barre collante : elle se fixe sous la navbar (h-16) quand on descend la page.
export const FiltresCategories = ({ categories, categorieActive, onChange }) => (
  <div
    id="carte"
    className="sticky top-16 z-30 scroll-mt-16 border-b border-border bg-background/95 py-3 backdrop-blur"
  >
    <div className="flex gap-2 overflow-x-auto scrollbar-none">
      <Filtre actif={categorieActive === null} onClick={() => onChange(null)}>
        Tous les produits
      </Filtre>

      {categories.map((cat) => (
        <Filtre key={cat.id} actif={categorieActive === cat.id} onClick={() => onChange(cat.id)}>
          {cat.nom}
        </Filtre>
      ))}
    </div>
  </div>
);