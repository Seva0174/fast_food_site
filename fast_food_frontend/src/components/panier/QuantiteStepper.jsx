import { Minus, Plus } from 'lucide-react';
import { Bouton } from '../ui/bouton';

export const QuantiteStepper = ({ quantite, onDiminuer, onAugmenter }) => (
  <div className="flex items-center rounded-full border border-border bg-background/40">
    <Bouton variante="fantome" taille="icone" onClick={onDiminuer} aria-label="Diminuer la quantité">
      <Minus className="h-4 w-4" />
    </Bouton>

    <span className="min-w-6 text-center text-sm font-bold tabular-nums" aria-live="polite">
      {quantite}
    </span>

    <Bouton variante="fantome" taille="icone" onClick={onAugmenter} aria-label="Augmenter la quantité">
      <Plus className="h-4 w-4" />
    </Bouton>
  </div>
);
