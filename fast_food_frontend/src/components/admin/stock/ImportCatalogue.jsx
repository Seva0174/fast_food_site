import { useId, useState } from 'react';
import { Upload } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';

// Import d'un catalogue fournisseur au format CSV (nom_matiere;prix_unitaire), dans un encart qui
// explique le format. Sans onFermer, l'encart reste ouvert : le catalogue est vide et l'import est la
// seule chose à faire.
export const ImportCatalogue = ({ enCours, onImporter, onFermer }) => {
  const catalogueVide = !onFermer;
  const id = useId();
  const [fichier, setFichier] = useState(null);

  const soumettre = async (e) => {
    e.preventDefault();
    const formulaire = e.currentTarget;
    if (await onImporter(fichier)) {
      setFichier(null);
      formulaire.reset();
      onFermer?.();
    }
  };

  return (
    <form
      onSubmit={soumettre}
      aria-labelledby={`${id}-titre`}
      className="space-y-3 rounded-xl border border-border bg-card p-4"
    >
      <div>
        <h5 id={`${id}-titre`} className="font-semibold text-foreground">
          {catalogueVide ? 'Catalogue vide' : 'Importer un catalogue'}
        </h5>
        <p id={`${id}-aide`} className="mt-1 text-sm text-muted-foreground">
          {catalogueVide && 'Importe le catalogue de ce fournisseur pour pouvoir lui passer commande. '}
          Un fichier CSV, une ligne par article au format{' '}
          <code className="rounded bg-secondary px-1 py-0.5 text-foreground">nom_matiere;prix_unitaire</code>{' '}
          (ex : <code className="rounded bg-secondary px-1 py-0.5 text-foreground">Steak 150g;1.20</code>). L'import
          remplace le catalogue actuel de ce fournisseur.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFichier(e.target.files[0] ?? null)}
          aria-label="Fichier CSV du catalogue"
          aria-describedby={`${id}-aide`}
          className="min-w-0 max-w-full flex-1 text-sm text-muted-foreground file:mr-3 file:min-h-9 file:cursor-pointer file:rounded-lg file:border file:border-border file:bg-secondary file:px-3 file:text-sm file:font-semibold file:text-secondary-foreground hover:file:bg-accent"
        />
        {onFermer && (
          <Bouton variante="secondaire" taille="sm" onClick={onFermer}>
            Annuler
          </Bouton>
        )}
        <Bouton type="submit" variante="sombre" taille="sm" disabled={!fichier || enCours}>
          <Upload className="h-4 w-4" aria-hidden="true" />
          Importer
        </Bouton>
      </div>
    </form>
  );
};
