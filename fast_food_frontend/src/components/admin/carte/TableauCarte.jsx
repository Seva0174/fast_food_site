import { Fragment } from 'react';
import { LigneProduit } from './LigneProduit';

// Tableau de la carte. `groupes` vient de produitsParCategorie : [{ categorie, produits }].
export const TableauCarte = ({ groupes, ...actions }) => {
  if (groupes.length === 0) {
    return <p className="py-6 text-center text-sm text-gray-400">Aucun produit à la carte.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b bg-gray-50 font-semibold text-gray-600">
            <th className="px-4 py-3">Image</th>
            <th className="px-4 py-3">Nom</th>
            <th className="px-4 py-3">Catégorie</th>
            <th className="px-4 py-3">Prix</th>
            <th className="px-4 py-3">Disponibilité</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {groupes.map(({ categorie, produits }) => (
            <Fragment key={categorie.id}>
              <tr className="bg-gray-100/80 font-bold text-gray-700">
                <td colSpan="6" className="px-4 py-2 text-xs uppercase tracking-wider">
                  {categorie.nom}
                </td>
              </tr>
              {produits.map((produit) => (
                <LigneProduit key={produit.id} produit={produit} {...actions} />
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};