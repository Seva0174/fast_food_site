import { useContext } from 'react';
import { ContextePanier } from '../context/ContextePanier';
import { Plus, Minus, Trash2, ShoppingBag, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PanierContent = ({ onClose }) => {
  const {
    panier,
    ajouterAuPanier,
    retirerDuPanier,
    supprimerDuPanier,
    viderPanier,
    totalArticles,
    totalPrix,
  } = useContext(ContextePanier);

  const navigate = useNavigate();

  const handleCommander = () => {
    if (onClose) onClose();
    navigate('/commander');
  };

  if (panier.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-500 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black"
          >
            <X className="w-6 h-6" />
          </button>
        )}
        <ShoppingBag className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium">Votre panier est vide</p>
        <p className="text-sm mt-1">Ajoutez des produits pour commencer.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* En-tête avec disposition nette */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-bold text-gray-800">Mon Panier ({totalArticles})</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={viderPanier}
            className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 bg-red-50 px-2.5 py-1 rounded-lg"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Vider
          </button>

          {/* Bouton Fermer (s'affiche uniquement si onClose est transmis, ex: Mobile) */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Liste des produits */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {panier.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-3 shadow-sm"
          >
            <div className="flex-1 min-w-0 pr-3">
              <h4 className="font-semibold text-sm text-gray-800 truncate">{item.nom}</h4>
              <p className="text-xs text-gray-500">
                {Number(item.prix).toFixed(2)} € × {item.quantite}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 p-0.5">
                <button
                  onClick={() => retirerDuPanier(item.id)}
                  className="p-1 hover:bg-white rounded text-gray-600"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-xs font-bold text-gray-800">{item.quantite}</span>
                <button
                  onClick={() => ajouterAuPanier(item)}
                  className="p-1 hover:bg-white rounded text-gray-600"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => supprimerDuPanier(item.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Résumé et bouton Passer la commande */}
      <div className="p-4 border-t border-gray-200 bg-white space-y-3">
        <div className="flex justify-between items-center text-lg font-bold text-gray-900">
          <span>Total</span>
          <span className="text-red-600">{totalPrix.toFixed(2)} €</span>
        </div>
        <button
          onClick={handleCommander}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2"
        >
          <span>Passer la commande</span>
        </button>
      </div>
    </div>
  );
};