import { Pencil, Trash2 } from 'lucide-react';
import { ComposantsFormule } from '../produits/ComposantsFormule';
import { Bouton } from '../ui/bouton';
import { QuantiteStepper } from './QuantiteStepper';
import { peutEtreModifie } from '../../lib/produit';

export const PanierLigne = ({ item, onDiminuer, onAugmenter, onSupprimer, onModifier }) => (
  <article className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
    <div className="min-w-0 flex-1 pr-3">
      <h4 className="truncate text-sm font-semibold text-gray-800">{item.nom}</h4>
      <p className="text-xs text-gray-500">
        {Number(item.prix).toFixed(2)} € x {item.quantite}
      </p>
      <ComposantsFormule composants={item.composants} afficherOptions={false} />
    </div>

    <div className="flex items-center gap-2">
      <QuantiteStepper
        quantite={item.quantite}
        onDiminuer={onDiminuer}
        onAugmenter={onAugmenter}
      />

      {onModifier && peutEtreModifie(item) && (
        <Bouton
          variante="fantome"
          taille="icone"
          className="hover:text-blue-600"
          onClick={() => onModifier(item)}
          title="Modifier les options"
        >
          <Pencil className="h-4 w-4" />
        </Bouton>
      )}

      <Bouton
        variante="fantome"
        taille="icone"
        className="hover:text-red-600"
        onClick={onSupprimer}
        title="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </Bouton>
    </div>
  </article>
);