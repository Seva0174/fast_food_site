import { useState } from 'react';
import { Bouton } from '@/components/ui/bouton';
import { BandeauMessage } from '@/components/ui/bandeau';
import { LigneStock } from './LigneStock';

export const TableauStocks = ({
  stocks,
  chargement,
  erreur,
  stockVide,
  enCours,
  onRecharger,
  onEffacerFiltres,
  onModifier,
  onSupprimer,
}) => {
  // Une seule ligne en édition à la fois ; les crayons des autres lignes sont inactifs en attendant
  const [idEnEdition, setIdEnEdition] = useState(null);

  if (chargement) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Chargement des stocks…
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

  if (stockVide) {
    return (
      <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Aucune matière première pour le moment. Ajoute la première avec « Ajouter un ingrédient » : elle
        pourra ensuite entrer dans les recettes et les commandes fournisseurs.
      </p>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        <span>Aucun ingrédient ne correspond à ces filtres.</span>
        <Bouton variante="secondaire" taille="sm" onClick={onEffacerFiltres}>
          Effacer les filtres
        </Bouton>
      </div>
    );
  }

  return (
    // relative : les éléments sr-only (positionnés en absolu) restent dans la zone qui défile
    <div className="relative overflow-x-auto rounded-xl border border-border bg-card">
      {/* Largeurs fixes : les colonnes ne bougent pas quand une ligne passe en édition */}
      <table className="w-full min-w-[52rem] table-fixed border-collapse text-left text-sm">
        <caption className="sr-only">Niveaux de stock des matières premières, les plus urgents d'abord</caption>
        <colgroup>
          <col className="w-[28%]" />
          <col className="w-[34%]" />
          <col className="w-[12%]" />
          <col className="w-[26%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th scope="col" className="p-3 font-medium">Ingrédient</th>
            <th scope="col" className="p-3 text-right font-medium">Quantité</th>
            <th scope="col" className="p-3 font-medium">État</th>
            <th scope="col" className="p-3 text-right font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {stocks.map((stock) => (
            <LigneStock
              key={stock.id}
              stock={stock}
              enEdition={idEnEdition === stock.id}
              editionAilleurs={idEnEdition !== null && idEnEdition !== stock.id}
              desactive={enCours}
              onEditer={setIdEnEdition}
              onModifier={onModifier}
              onSupprimer={onSupprimer}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
