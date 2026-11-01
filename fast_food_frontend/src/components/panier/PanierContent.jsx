import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, X } from 'lucide-react';
import { ContextePanier } from '../../context/ContextePanier';
import { Bouton } from '../ui/bouton';
import { PanierLigne } from './PanierLigne';
import { PanierVide } from './PanierVide';
import { formaterPrix } from '../../lib/prix';

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

  // "Vider" demande un second appui : evite de perdre tout le panier sur un appui accidentel
  const [confirmerVidage, setConfirmerVidage] = useState(false);
  useEffect(() => {
    if (!confirmerVidage) return undefined;
    const minuterie = setTimeout(() => setConfirmerVidage(false), 4000);
    return () => clearTimeout(minuterie);
  }, [confirmerVidage]);

  const appuyerVider = () => {
    if (confirmerVidage) {
      setConfirmerVidage(false);
      viderPanier();
    } else {
      setConfirmerVidage(true);
    }
  };

  if (panier.length === 0) {
    return <PanierVide onClose={onClose} />;
  }

  const handleCommander = () => {
    onClose?.();
    navigate('/commander');
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border p-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="titre-marque whitespace-nowrap text-2xl">Mon panier ({totalArticles})</h2>
        </div>

        <div className="flex items-center gap-1">
          <Bouton
            variante={confirmerVidage ? 'dangerDoux' : 'fantome'}
            taille="sm"
            className="min-h-11 whitespace-nowrap lg:min-h-9"
            onClick={appuyerVider}
          >
            {!confirmerVidage && <Trash2 className="h-4 w-4" aria-hidden="true" />}
            {confirmerVidage ? 'Confirmer ?' : 'Vider'}
          </Bouton>

          {onClose && (
            <Bouton variante="fantome" taille="icone" onClick={onClose} aria-label="Fermer">
              <X className="h-5 w-5" />
            </Bouton>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 divide-y divide-border overflow-y-auto overscroll-contain p-4 scrollbar-thin">
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

      <footer className="shrink-0 space-y-3 border-t border-border p-4">
        <div className="flex items-center justify-between text-lg font-bold">
          <span>Total</span>
          <span className="tabular-nums">{formaterPrix(totalPrix)}</span>
        </div>

        <Bouton taille="lg" className="w-full font-bold" onClick={handleCommander}>
          Passer la commande
        </Bouton>
      </footer>
    </div>
  );
};