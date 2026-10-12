import { Minus, Plus } from 'lucide-react';
import { Bouton } from '../ui/bouton';

export const QuantiteStepper = ({ quantite, onDiminuer, onAugmenter }) => (
  <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5">
    <Bouton variante="fantome" taille="icone" onClick={onDiminuer} aria-label="Diminuer la quantité">
      <Minus className="h-3.5 w-3.5" />
    </Bouton>

    <span className="px-2 text-xs font-bold text-gray-800">{quantite}</span>

    <Bouton variante="fantome" taille="icone" onClick={onAugmenter} aria-label="Augmenter la quantité">
      <Plus className="h-3.5 w-3.5" />
    </Bouton>
  </div>
);