import { useState, useContext } from 'react';
import { ContextePanier } from '../../context/ContextePanier';
import { PanierContent } from './PanierContent';
import { Bouton } from '../ui/bouton';

export const PanierMobileSheet = ({ onEditItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { totalArticles, totalPrix } = useContext(ContextePanier);

  return (
    <div className="lg:hidden">
      {/* Affiche le bouton uniquement si le panier contient au moins un article */}
      {totalArticles > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40">
          <Bouton
            taille="lg"
            onClick={() => setIsOpen(true)}
            className="w-full justify-between rounded-2xl px-5 py-3.5 text-lg font-extrabold shadow-xl active:scale-95"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-white px-2.5 py-0.5 text-xs font-extrabold text-red-600">
                {totalArticles}
              </div>
              <span className="text-base font-bold">Voir le panier</span>
            </div>
            <span className="text-lg font-extrabold">{totalPrix.toFixed(2)} €</span>
          </Bouton>
        </div>
      )}

      {/* Tiroir Bottom Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm animate-fadeIn">
          {/* Overlay : clic à l'extérieur pour fermer */}
          <div className="flex-1" onClick={() => setIsOpen(false)} />

          {/* Contenu du tiroir */}
          <div className="relative flex h-[550px] max-h-[85vh] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl">
            <PanierContent onEditItem={onEditItem} onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};