import { ShoppingBag, X } from 'lucide-react';
import { Bouton } from '../ui/bouton';

export const PanierVide = ({ onClose }) => (
  <div className="relative flex h-full flex-col items-center justify-center p-6 text-center text-muted-foreground">
    {onClose && (
      <Bouton
        variante="fantome"
        taille="icone"
        className="absolute right-4 top-4"
        onClick={onClose}
        aria-label="Fermer"
      >
        <X className="h-6 w-6" />
      </Bouton>
    )}

    <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground/40" />
    <p className="text-lg font-medium text-foreground">Votre panier est vide</p>
    <p className="mt-1 text-sm">Ajoutez un produit de la carte pour commencer.</p>
  </div>
);