import { useState } from 'react';
import { X } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';

// Un produit proposé dans un emplacement : prix seul, surcout dans le menu (modifiable) et retrait.
export const LienProduitFormule = ({ lien, onModifierSurcout, onRetirer }) => {
  const [enEdition, setEnEdition] = useState(false);
  const [surcout, setSurcout] = useState('0');

  const demarrerEdition = () => {
    setSurcout(String(lien.surcout ?? 0));
    setEnEdition(true);
  };

  const enregistrer = async () => {
    if (await onModifierSurcout(lien.id, surcout)) setEnEdition(false);
  };

  return (
    <div className="space-y-1 rounded border bg-gray-50/60 px-3 py-2 text-xs">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-semibold text-gray-800">{lien.nomProduit}</span>
          {!lien.estDispo && (
            <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
              Rupture
            </span>
          )}
          <div className="text-[11px] text-gray-500">Prix seul : {Number(lien.prixProduit).toFixed(2)} €</div>
        </div>
        <Bouton
          variante="lien"
          taille="nu"
          className="px-1"
          onClick={() => onRetirer(lien.id)}
          title="Retirer ce produit de l'emplacement"
          aria-label="Retirer ce produit de l'emplacement"
        >
          <X className="h-4 w-4" />
        </Bouton>
      </div>

      {enEdition ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.01"
            min="0"
            value={surcout}
            onChange={(e) => setSurcout(e.target.value)}
            className="w-20 rounded border bg-white px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-red-500"
          />
          <span className="text-gray-500">€</span>
          <Bouton taille="xs" onClick={enregistrer}>
            OK
          </Bouton>
          <Bouton variante="secondaire" taille="xs" onClick={() => setEnEdition(false)}>
            Annuler
          </Bouton>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-gray-600">
            Surcoût dans le menu :{' '}
            <strong className={Number(lien.surcout) > 0 ? 'text-green-700' : 'text-gray-700'}>
              {Number(lien.surcout) > 0 ? `+${Number(lien.surcout).toFixed(2)} €` : 'aucun'}
            </strong>
          </span>
          <Bouton variante="lienInfo" taille="nu" onClick={demarrerEdition}>
            Modifier
          </Bouton>
        </div>
      )}
    </div>
  );
};