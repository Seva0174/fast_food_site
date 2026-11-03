import { LigneStock } from './LigneStock';

export const TableauStocks = ({ stocks, chargement, onModifier, onSupprimer }) => (
  <div className="overflow-x-auto rounded-xl border border-border bg-card">
    <table className="w-full border-collapse text-left text-sm">
      <caption className="sr-only">Niveaux de stock des matières premières</caption>
      <thead>
        <tr className="border-b border-border text-muted-foreground">
          <th scope="col" className="p-3 font-medium">ID</th>
          <th scope="col" className="p-3 font-medium">Ingrédient</th>
          <th scope="col" className="p-3 font-medium">Quantité</th>
          <th scope="col" className="p-3 font-medium">Unité</th>
          <th scope="col" className="p-3 text-center font-medium">État</th>
          <th scope="col" className="p-3 text-right font-medium"><span className="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {stocks.map((stock) => (
          <LigneStock
            key={stock.id}
            stock={stock}
            desactive={chargement}
            onModifier={onModifier}
            onSupprimer={onSupprimer}
          />
        ))}
      </tbody>
    </table>
  </div>
);