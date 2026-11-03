import { useId } from 'react';
import { Search, X } from 'lucide-react';
import { ETAT_FILTRE } from '@/lib/carte';
import { produitsDeCategorie } from '@/lib/produit';

// Filtres de l'admin : actif en Crème, pas en orange (l'orange reste au bouton « Ajouter un produit »)
const classePastille = (actif) =>
  `inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-sm font-semibold transition-colors ${
    actif
      ? 'border-foreground bg-foreground text-background'
      : 'border-border bg-secondary text-secondary-foreground hover:bg-accent'
  }`;

const classeSegment = (actif) =>
  `inline-flex min-h-8 items-center gap-1.5 whitespace-nowrap rounded-md px-3 text-sm font-semibold transition-colors ${
    actif ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
  }`;

// Recherche, catégories et état, au-dessus du tableau de la carte.
// filtres : { recherche, idCategorie (null = toutes), etat (null, 'a_corriger' ou 'hors_vente') }.
// nombres : { a_corriger, hors_vente }, affichés dans le filtre d'état.
export const FiltresCarte = ({ filtres, categories, produits, nombres, onChange }) => {
  const idRecherche = useId();
  const modifier = (changement) => onChange({ ...filtres, ...changement });
  const categoriesNonVides = categories.filter((c) => produitsDeCategorie(produits, c.id).length > 0);

  return (
    <div className="space-y-3">
      {/* Première rangée : chercher, et l'état des produits (une autre question que la catégorie) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-80 sm:shrink-0">
          <label htmlFor={idRecherche} className="sr-only">
            Rechercher un produit par nom, description ou catégorie
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id={idRecherche}
            type="search"
            value={filtres.recherche}
            onChange={(e) => modifier({ recherche: e.target.value })}
            onKeyDown={(e) => e.key === 'Escape' && filtres.recherche && modifier({ recherche: '' })}
            placeholder="Nom, description, catégorie…"
            autoComplete="off"
            className="min-h-10 w-full rounded-lg border border-input bg-card pl-9 pr-9 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-search-cancel-button]:hidden"
          />
          {filtres.recherche && (
            <button
              type="button"
              onClick={() => modifier({ recherche: '' })}
              aria-label="Effacer la recherche"
              className="absolute right-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div role="group" aria-label="Filtrer par état" className="flex rounded-lg bg-muted p-1">
          {[
            { etat: null, libelle: 'Tous' },
            {
              etat: ETAT_FILTRE.A_CORRIGER,
              libelle: 'À corriger',
              nombre: nombres[ETAT_FILTRE.A_CORRIGER],
            },
            {
              etat: ETAT_FILTRE.HORS_VENTE,
              libelle: 'Hors vente',
              nombre: nombres[ETAT_FILTRE.HORS_VENTE],
            },
          ].map(({ etat, libelle, nombre }) => (
            <button
              key={libelle}
              type="button"
              aria-pressed={filtres.etat === etat}
              onClick={() => modifier({ etat })}
              className={classeSegment(filtres.etat === etat)}
            >
              {libelle}
              {nombre !== undefined && (
                <span
                  className={`tabular-nums ${
                    etat === ETAT_FILTRE.A_CORRIGER && nombre > 0 ? 'text-destructive' : 'text-muted-foreground'
                  }`}
                >
                  {nombre}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer par catégorie">
        <button
          type="button"
          aria-pressed={filtres.idCategorie === null}
          onClick={() => modifier({ idCategorie: null })}
          className={classePastille(filtres.idCategorie === null)}
        >
          Toutes
        </button>
        {categoriesNonVides.map((categorie) => (
          <button
            key={categorie.id}
            type="button"
            aria-pressed={filtres.idCategorie === categorie.id}
            onClick={() => modifier({ idCategorie: categorie.id })}
            className={classePastille(filtres.idCategorie === categorie.id)}
          >
            {categorie.nom}
          </button>
        ))}
      </div>
    </div>
  );
};
