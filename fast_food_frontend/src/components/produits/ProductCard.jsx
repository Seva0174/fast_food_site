import { useContext } from 'react';
import { ShoppingBag } from 'lucide-react';
import { ContextePanier } from '../../context/ContextePanier';
import { Bouton } from '../ui/bouton';
import { Badge } from '../ui/badge';
import { estPersonnalisable, estDisponible, aDesOptions } from '../../lib/produit';

const libelleAction = (produit) => {
  if (produit.estFormule) return 'Composer mon menu';
  if (aDesOptions(produit)) return 'Personnaliser';
  return 'Ajouter au panier';
};

export const ProductCard = ({ produit, onOpenModal }) => {
  const { ajouterAuPanier } = useContext(ContextePanier);

  const disponible = estDisponible(produit);
  const libelle = libelleAction(produit);

  const handleClick = () => {
    if (estPersonnalisable(produit)) {
      onOpenModal?.(produit);
    } else {
      ajouterAuPanier(produit, []);
    }
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        {produit.imageUrl && (
          <img src={produit.imageUrl} alt={produit.nom} className="h-full w-full object-cover" />
        )}

        {produit.estFormule && (
          <Badge className="absolute left-2 top-2 px-2.5 py-1 shadow">Menu</Badge>
        )}

        {!disponible && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-bold text-white">
            {produit.estDispo ? 'Indisponible' : 'Épuisé'}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-bold text-gray-800">{produit.nom}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">{produit.description}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="text-xl font-extrabold text-gray-900">
            {Number(produit.prix).toFixed(2)} €
          </span>

          <Bouton taille="sm" onClick={handleClick} disabled={!disponible} title={libelle}>
            <ShoppingBag className="h-4 w-4" />
            <span>{libelle}</span>
          </Bouton>
        </div>
      </div>
    </article>
  );
};