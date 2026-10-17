import { X } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';

// Une option d'un groupe : déduction de stock, surcoût, modification et suppression.
export const LigneOption = ({ option, onModifier, onSupprimer }) => (
  <div className="flex items-center justify-between rounded border bg-gray-50/60 px-3 py-2 text-xs hover:bg-gray-50">
    <div>
      <span className="font-semibold text-gray-800">{option.nom}</span>
      <div className="text-[11px] text-gray-500">
        Déduction stock : {option.quantiteDeduite}
        {option.surcout > 0 && (
          <span className="ml-2 font-bold text-green-700">(+{Number(option.surcout).toFixed(2)} €)</span>
        )}
      </div>
    </div>

    <div className="flex items-center gap-2">
      <Bouton variante="lienInfo" taille="nu" className="text-xs" onClick={onModifier}>
        Modifier
      </Bouton>
      <Bouton
        variante="lien"
        taille="nu"
        className="px-1"
        onClick={onSupprimer}
        title="Supprimer cette option"
        aria-label="Supprimer cette option"
      >
        <X className="h-4 w-4" />
      </Bouton>
    </div>
  </div>
);