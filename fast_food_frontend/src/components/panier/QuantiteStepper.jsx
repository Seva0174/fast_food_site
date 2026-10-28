import { Minus, Plus } from 'lucide-react';
import { Bouton } from '../ui/bouton';

export const QuantiteStepper = ({ quantite, onDiminuer, onAugmenter }) => (
  <div className="flex items-center rounded-lg border border-border bg-background/40 p-0.5">
    <Bouton variante="fantome" taille="icone" onClick={onDiminuer} aria-label="Diminuer la quantité">
      <Minus className="h-3.5 w-3.5" />
    </Bouton>

    <span className="min-w-6 px-1 text-center text-xs font-bold tabular-nums">{quantite}</span>

    <Bouton variante="fantome" taille="icone" onClick={onAugmenter} aria-label="Augmenter la quantité">
      <Plus className="h-3.5 w-3.5" />
    </Bouton>
  </div>
);