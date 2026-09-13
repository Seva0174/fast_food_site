import { useContext } from 'react';
import { ShoppingBag } from 'lucide-react';
import { ContextePanier } from '../context/ContextePanier';

export const ProductCard = ({ produit }) => {
  const { ajouterAuPanier } = useContext(ContextePanier);

  const isDisponible = produit.estDispo ?? produit.est_dispo ?? true;
  const imageUrl = produit.imageUrl || produit.image_url;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div className="h-48 w-full bg-gray-100 overflow-hidden relative">
          {imageUrl ? (
            <img src={imageUrl} alt={produit.nom} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🍔</div>
          )}
          {!isDisponible && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold">
              Épuisé
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-800">{produit.nom}</h3>
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{produit.description}</p>
        </div>
      </div>

      <div className="p-4 pt-0 flex items-center justify-between mt-2 gap-2">
        <span className="text-xl font-extrabold text-gray-900">
          {Number(produit.prix).toFixed(2)} €
        </span>

        <button
          onClick={() => ajouterAuPanier(produit)}
          disabled={!isDisponible}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm text-sm"
          title="Ajouter au panier"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Ajouter au panier</span>
        </button>
      </div>
    </div>
  );
};