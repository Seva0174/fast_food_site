import { ShoppingBag, X } from 'lucide-react';
import { Bouton } from '../ui/bouton';

export const PanierVide = ({ onClose }) => (
  <div className="relative flex h-full flex-col items-center justify-center px-6 py-8 text-center text-muted-foreground">
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

    <ShoppingBag className="mb-3 h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
    <h2 className="titre-marque text-2xl text-foreground">Ton panier est vide</h2>
    <p className="mt-2 text-pretty text-sm">Ajoute un produit de la carte pour commencer.</p>
    <p className="mt-3 text-pretty text-xs">
      Retrait au comptoir ou livraison, sans paiement en ligne.
    </p>
  </div>
);
