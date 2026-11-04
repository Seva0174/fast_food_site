import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { BandeauMessage } from '@/components/ui/bandeau';
import { Bouton } from '@/components/ui/bouton';
import { LigneProduit } from './LigneProduit';

const SENS_ARIA = { asc: 'ascending', desc: 'descending' };

// En-tête de colonne triable : un clic trie dans chaque catégorie (croissant, décroissant, aucun).
const EnTeteTriable = ({ colonne, libelle, tri, onTrier, aide, className = '' }) => {
  const actif = tri?.colonne === colonne;
  const Icone = !actif ? ArrowUpDown : tri.sens === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th scope="col" aria-sort={actif ? SENS_ARIA[tri.sens] : undefined} className={`p-1.5 font-medium ${className}`}>
      <button
        type="button"
        onClick={() => onTrier(colonne)}
        title={aide}
        className={`inline-flex min-h-9 items-center gap-1.5 rounded-md px-1.5 transition-colors hover:text-foreground ${
          actif ? 'text-foreground' : ''
        }`}
      >
        {libelle}
        <Icone className={`h-3.5 w-3.5 ${actif ? '' : 'opacity-50'}`} aria-hidden="true" />
      </button>
    </th>
  );
};

// Tableau de la carte. `groupes` vient de produitsParCategorie : [{ categorie, produits }].
// carteVide : aucun produit du tout ; sinon un tableau vide vient des filtres.
export const TableauCarte = ({
  groupes,
  chargement,
  erreur,
  carteVide,
  filtresActifs,
  descriptionFiltres,
  onEffacerFiltres,
  onRecharger,
  tri,
  onTrier,
  ...actions
}) => {
  if (chargement) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Chargement de la carte…
      </p>
    );
  }

  if (erreur) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <BandeauMessage message={{ texte: erreur, type: 'erreur' }} className="flex-1" />
        <Bouton variante="secondaire" onClick={onRecharger}>
          Réessayer
        </Bouton>
      </div>
    );
  }

  if (carteVide) {
    return (
      <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        La carte est vide. Crée le premier produit avec « Ajouter un produit ».
      </p>
    );
  }

  if (groupes.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p role="status">
          Aucun produit ne correspond{descriptionFiltres ? ` à : ${descriptionFiltres}` : ' à ces filtres'}.
        </p>
        {filtresActifs && (
          <Bouton variante="secondaire" taille="sm" onClick={onEffacerFiltres}>
            Effacer les filtres
          </Bouton>
        )}
      </div>
    );
  }

  return (
    // relative : les éléments sr-only (positionnés en absolu) restent dans la zone qui défile
    <div className="relative overflow-x-auto rounded-xl border border-border bg-card">
      {/* Colonnes de droite à largeur fixe (actions, interrupteur) ; le nom du produit prend le reste */}
      <table className="w-full min-w-[58rem] table-fixed border-collapse text-left text-sm">
        <caption className="sr-only">Produits de la carte, par catégorie</caption>
        <colgroup>
          <col />
          <col className="w-64" />
          <col className="w-24" />
          <col className="w-44" />
          <col className="w-48" />
        </colgroup>
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <EnTeteTriable colonne="nom" libelle="Produit" tri={tri} onTrier={onTrier} />
            <th scope="col" className="p-3 font-medium">Configuration</th>
            <EnTeteTriable colonne="prix" libelle="Prix" tri={tri} onTrier={onTrier} className="text-right" />
            <EnTeteTriable
              colonne="statut"
              libelle="Vente"
              aide="Trier par état : produits à corriger d'abord"
              tri={tri}
              onTrier={onTrier}
            />
            <th scope="col" className="p-3 text-right font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        {groupes.map(({ categorie, produits }) => (
          <tbody key={categorie.id} className="divide-y divide-border border-b border-border last:border-b-0">
            {/* Bande de catégorie : titre d'enseigne sur un palier d'anthracite plus clair que les lignes */}
            <tr className="border-t-2 border-border bg-accent">
              <th scope="colgroup" colSpan={5} className="titre-marque px-3 py-2 text-left text-base">
                {categorie.nom}
                <span className="ml-2 font-sans text-sm font-normal normal-case tabular-nums text-muted-foreground">
                  {produits.length}
                </span>
              </th>
            </tr>
            {produits.map((produit) => (
              <LigneProduit key={produit.id} produit={produit} {...actions} />
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
};
