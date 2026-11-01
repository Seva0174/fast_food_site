import { Pencil, Trash2 } from 'lucide-react';
import { ComposantsFormule } from '../produits/ComposantsFormule';
import { Bouton } from '../ui/bouton';
import { QuantiteStepper } from './QuantiteStepper';
import { peutEtreModifie } from '../../lib/produit';
import { formaterPrix } from '../../lib/prix';

export const PanierLigne = ({ item, onDiminuer, onAugmenter, onSupprimer, onModifier }) => (
  <article className="py-3 first:pt-0 last:pb-0">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold">{item.nom}</h3>
        {item.options.length > 0 && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {item.options.map((option) => option.nom).join(', ')}
          </p>
        )}
        <ComposantsFormule composants={item.composants} afficherOptions={false} />
      </div>
      <p className="shrink-0 text-sm font-bold tabular-nums">
        {formaterPrix(item.prix * item.quantite)}
      </p>
    </div>

    <div className="mt-2 flex items-center justify-between">
      <QuantiteStepper quantite={item.quantite} onDiminuer={onDiminuer} onAugmenter={onAugmenter} />

      <div className="flex items-center">
        {onModifier && peutEtreModifie(item) && (
          <Bouton
            variante="fantome"
            taille="icone"
            onClick={() => onModifier(item)}
            title="Modifier"
            aria-label={`Modifier ${item.nom}`}
          >
            <Pencil className="h-4 w-4" />
          </Bouton>
        )}

        <Bouton
          variante="fantome"
          taille="icone"
          onClick={onSupprimer}
          title="Retirer"
          aria-label={`Retirer ${item.nom}`}
        >
          <Trash2 className="h-4 w-4" />
        </Bouton>
      </div>
    </div>
  </article>
);
