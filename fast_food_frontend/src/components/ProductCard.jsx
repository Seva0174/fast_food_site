import { useContext } from 'react';
import { Plus, Minus } from 'lucide-react';
import { ContextePanier } from '../context/ContextePanier';

export const ProductCard = ({ produit }) => {
  const { panier, ajouterAuPanier, retirerDuPanier } = useContext(ContextePanier);

  const isDisponible = produit.estDispo ?? produit.est_dispo ?? true;
  const imageUrl = produit.imageUrl || produit.image_url;

  // On cherche si ce produit est déjà dans le panier
  const articleDansPanier = panier.find((item) => item.id === produit.id);
  const quantiteDansPanier = articleDansPanier ? articleDansPanier.quantite : 0;

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

      <div className="p-4 pt-0 flex items-center justify-between mt-2">
        <span className="text-xl font-extrabold text-gray-900">
          {Number(produit.prix).toFixed(2)} €
        </span>

        {/* Si le produit est déjà dans le panier, on affiche - QUANTITÉ + */}
        {quantiteDansPanier > 0 ? (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => retirerDuPanier(produit.id)}
              className="p-1 hover:bg-white rounded text-gray-700 transition shadow-sm"
              title="Retirer un article"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-gray-800 px-1 text-sm">{quantiteDansPanier}</span>
            <button
              onClick={() => ajouterAuPanier(produit)}
              disabled={!isDisponible}
              className="p-1 hover:bg-white rounded text-gray-700 transition shadow-sm"
              title="Ajouter un article"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Sinon bouton + simple */
          <button
            onClick={() => ajouterAuPanier(produit)}
            disabled={!isDisponible}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white p-2.5 rounded-lg flex items-center justify-center transition shadow-sm"
            title="Ajouter au panier"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};