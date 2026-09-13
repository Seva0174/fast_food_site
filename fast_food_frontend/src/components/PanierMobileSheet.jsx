import { useState, useContext } from 'react';
import { ContextePanier } from '../context/ContextePanier';
import { PanierContent } from './PanierContent';

export const PanierMobileSheet = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { totalArticles, totalPrix } = useContext(ContextePanier);

  return (
    <div className="lg:hidden">
      {/* Affiche le bouton uniquement si le panier contient au moins un article */}
      {totalArticles > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="w-full bg-red-600 text-white font-bold py-3.5 px-5 rounded-2xl shadow-xl flex items-center justify-between active:scale-95 transition"
          >
            <div className="flex items-center gap-2">
              <div className="bg-white text-red-600 px-2.5 py-0.5 rounded-full text-xs font-extrabold">
                {totalArticles}
              </div>
              <span>Voir le panier</span>
            </div>
            <span className="text-lg font-extrabold">{totalPrix.toFixed(2)} €</span>
          </button>
        </div>
      )}

      {/* Tiroir Bottom Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm animate-fadeIn">
          {/* Overlay : Clic à l'extérieur pour fermer */}
          <div className="flex-1" onClick={() => setIsOpen(false)} />

          {/* Contenu du tiroir */}
          <div className="bg-white rounded-t-3xl max-h-[85vh] h-[550px] flex flex-col overflow-hidden shadow-2xl relative">
            <PanierContent onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};