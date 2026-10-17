import { useState } from 'react';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { totalLigne } from '@/lib/approvisionnement';

// Bon de commande en cours : lignes modifiables, total et validation.
export const BonCommande = ({
  bon,
  total,
  chargement,
  onIncrementer,
  onDecrementer,
  onModifierQuantite,
  onValider,
}) => (
  <div className="flex flex-col justify-between space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div className="space-y-3">
      <h4 className="flex items-center gap-2 border-b pb-2 text-sm font-bold text-gray-800">
        <ShoppingCart className="h-4 w-4 text-red-600" />
        Bon de commande
      </h4>

      {bon.length === 0 ? (
        <p className="py-6 text-center text-xs text-gray-500">Aucun article sélectionné</p>
      ) : (
        <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
          {bon.map((ligne) => (
            <LigneBon
              key={ligne.idStock}
              ligne={ligne}
              onIncrementer={onIncrementer}
              onDecrementer={onDecrementer}
              onModifierQuantite={onModifierQuantite}
            />
          ))}
        </div>
      )}
    </div>

    {bon.length > 0 && (
      <div className="space-y-2 border-t pt-3">
        <div className="flex justify-between text-sm font-bold text-gray-800">
          <span>Total HT :</span>
          <span className="text-red-600">{total.toFixed(2)} €</span>
        </div>
        <Bouton taille="xs" className="w-full py-2" onClick={onValider} disabled={chargement}>
          Valider la commande
        </Bouton>
      </div>
    )}
  </div>
);

// Une ligne du bon. La saisie manuelle reste locale tant que le champ a le focus ;
// la quantité n'est envoyée au bon qu'à la sortie du champ ou sur Entrée.
const LigneBon = ({ ligne, onIncrementer, onDecrementer, onModifierQuantite }) => {
  // null = aucune saisie en cours, la quantité affichée vient du bon
  const [saisie, setSaisie] = useState(null);

  const validerSaisie = () => {
    if (saisie !== null) {
      onModifierQuantite(ligne.idStock, saisie);
      setSaisie(null);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 rounded border bg-white p-2 text-xs">
      <span className="max-w-[110px] truncate font-medium text-gray-800">{ligne.nom}</span>

      <div className="flex items-center gap-1">
        <Bouton
          variante="neutre"
          taille="nu"
          className="p-1"
          onClick={() => onDecrementer(ligne.idStock)}
          aria-label="Diminuer la quantité"
        >
          <Minus className="h-3 w-3" />
        </Bouton>

        <input
          type="text"
          inputMode="numeric"
          value={saisie ?? ligne.quantite}
          onChange={(e) => setSaisie(e.target.value)}
          onBlur={validerSaisie}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
          aria-label="Quantité"
          className="w-10 rounded border py-0.5 text-center font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-red-500"
        />

        <Bouton
          variante="neutre"
          taille="nu"
          className="p-1"
          onClick={() => onIncrementer(ligne.idStock)}
          aria-label="Augmenter la quantité"
        >
          <Plus className="h-3 w-3" />
        </Bouton>
      </div>

      <span className="min-w-[50px] text-right font-bold text-gray-700">
        {totalLigne(ligne).toFixed(2)} €
      </span>
    </div>
  );
};