import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, X } from 'lucide-react';
import { ContextePanier } from '../../context/ContextePanier';
import { Bouton } from '../ui/bouton';
import { PanierLigne } from './PanierLigne';
import { PanierVide } from './PanierVide';

export const PanierContent = ({ onClose, onEditItem }) => {
  const {
    panier,
    incrementerQuantite,
    retirerDuPanier,
    supprimerDuPanier,
    viderPanier,
    totalArticles,
    totalPrix,
  } = useContext(ContextePanier);

  const navigate = useNavigate();

  if (panier.length === 0) {
    return <PanierVide onClose={onClose} />;
  }

  const handleCommander = () => {
    onClose?.();
    navigate('/commander');
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-bold text-gray-800">Mon Panier ({totalArticles})</h2>
        </div>

        <div className="flex items-center gap-3">
          <Bouton variante="danger" taille="xs" onClick={viderPanier}>
            <Trash2 className="h-3.5 w-3.5" />
            Vider
          </Bouton>

          {onClose && (
            <Bouton variante="fantome" taille="icone" onClick={onClose} aria-label="Fermer">
              <X className="h-5 w-5" />
            </Bouton>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 scrollbar-thin">
        {panier.map((item) => (
          <PanierLigne
            key={item.id}
            item={item}
            onDiminuer={() => retirerDuPanier(item.id)}
            onAugmenter={() => incrementerQuantite(item.id)}
            onSupprimer={() => supprimerDuPanier(item.id)}
            onModifier={onEditItem}
          />
        ))}
      </div>

      <footer className="shrink-0 space-y-3 border-t border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between text-lg font-bold text-gray-900">
          <span>Total</span>
          <span className="text-red-600">{totalPrix.toFixed(2)} €</span>
        </div>

        <Bouton taille="lg" className="w-full rounded-xl font-bold shadow-md" onClick={handleCommander}>
          Passer la commande
        </Bouton>
      </footer>
    </div>
  );
};