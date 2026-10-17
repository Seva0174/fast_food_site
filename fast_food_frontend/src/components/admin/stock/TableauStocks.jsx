import { LigneStock } from './LigneStock';

export const TableauStocks = ({ stocks, chargement, onModifier, onSupprimer }) => (
  <div className="overflow-x-auto rounded-xl border">
    <table className="w-full border-collapse text-left text-xs">
      <thead>
        <tr className="border-b bg-gray-100 text-gray-600">
          <th className="p-3">ID</th>
          <th className="p-3">Ingrédient / Matière Première</th>
          <th className="p-3">Quantité en Stock</th>
          <th className="p-3">Unité</th>
          <th className="p-3 text-center">État</th>
          <th className="p-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y">
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