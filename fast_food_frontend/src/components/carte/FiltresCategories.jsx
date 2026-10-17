import { Bouton } from '../ui/bouton';

// Filtre en forme de pastille : actif en rouge, inactif en blanc
const Filtre = ({ actif, onClick, children }) => (
  <Bouton
    variante={actif ? 'principal' : 'secondaire'}
    taille="sm"
    className="whitespace-nowrap rounded-full px-5 py-2.5"
    onClick={onClick}
  >
    {children}
  </Bouton>
);

export const FiltresCategories = ({ categories, categorieActive, onChange }) => (
  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
    <Filtre actif={categorieActive === null} onClick={() => onChange(null)}>
      Tous les produits
    </Filtre>

    {categories.map((cat) => (
      <Filtre key={cat.id} actif={categorieActive === cat.id} onClick={() => onChange(cat.id)}>
        {cat.nom}
      </Filtre>
    ))}
  </div>
);