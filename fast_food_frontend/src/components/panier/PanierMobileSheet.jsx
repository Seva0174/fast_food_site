import { useState, useContext } from 'react';
import { ContextePanier } from '../../context/ContextePanier';
import { PanierContent } from './PanierContent';
import { Bouton } from '../ui/bouton';

export const PanierMobileSheet = ({ onEditItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { totalArticles, totalPrix } = useContext(ContextePanier);

  return (
    <div className="lg:hidden">
      {/* Barre fixe : uniquement si le panier contient au moins un article */}
      {totalArticles > 0 && (
        <div className="fixed inset-x-4 bottom-4 z-40 pb-[env(safe-area-inset-bottom)]">
          <Bouton
            taille="lg"
            onClick={() => setIsOpen(true)}
            className="w-full justify-between rounded-2xl px-5 py-3.5 shadow-xl shadow-black/50 active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary-foreground px-2.5 py-0.5 text-xs font-extrabold text-primary">
                {totalArticles}
              </div>
              <span className="text-base font-bold">Voir le panier</span>
            </div>
            <span className="text-lg font-extrabold tabular-nums">{totalPrix.toFixed(2)} €</span>
          </Bouton>
        </div>
      )}

      {/* Tiroir Bottom Sheet */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mon panier"
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 animate-in fade-in duration-200"
        >
          {/* Zone vide : clic a l'exterieur pour fermer */}
          <div className="flex-1" onClick={() => setIsOpen(false)} />

          <div className="relative flex h-[550px] max-h-[85vh] flex-col overflow-hidden rounded-t-3xl border-t border-border bg-card animate-in slide-in-from-bottom duration-300">
            <PanierContent onEditItem={onEditItem} onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};