import { useState } from 'react';
import { AlertTriangle, Edit2, Save, Trash2, X } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { ListeDeroulante } from '@/components/ui/liste';
import { UNITES, estEnAlerte, formaterQuantite } from '@/lib/stock';

// Une ligne du tableau des stocks, avec son propre mode édition.
export const LigneStock = ({ stock, desactive, onModifier, onSupprimer }) => {
  const [enEdition, setEnEdition] = useState(false);
  const [quantite, setQuantite] = useState('');
  const [unite, setUnite] = useState('');
  const enAlerte = estEnAlerte(stock);

  const demarrerEdition = () => {
    setQuantite(stock.quantite);
    setUnite(stock.uniteMesure);
    setEnEdition(true);
  };

  const sauvegarder = async () => {
    const reussi = await onModifier(stock.id, { quantite: Number(quantite), uniteMesure: unite });
    if (reussi) setEnEdition(false);
  };

  return (
    <tr className={`transition hover:bg-gray-50 ${enAlerte ? 'bg-amber-50/50' : ''}`}>
      <td className="p-3 font-bold text-gray-500">#{stock.id}</td>
      <td className="p-3 font-semibold text-gray-800">{stock.nom}</td>

      <td className="p-3">
        {enEdition ? (
          <input
            type="number"
            step="0.01"
            value={quantite}
            onChange={(e) => setQuantite(e.target.value)}
            className="w-24 rounded border p-1 text-xs font-semibold focus:ring-1 focus:ring-red-500"
          />
        ) : (
          <span className="text-sm font-bold text-gray-800">{formaterQuantite(stock.quantite)}</span>
        )}
      </td>

      <td className="p-3">
        {enEdition ? (
          <ListeDeroulante
            valeur={unite}
            onChange={setUnite}
            options={UNITES}
            className="min-w-[7rem] rounded border bg-white p-1 text-xs font-medium"
            classeItem="text-xs"
          />
        ) : (
          <span className="font-medium text-gray-500">{stock.uniteMesure}</span>
        )}
      </td>

      <td className="p-3 text-center">
        {enAlerte ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
            <AlertTriangle className="h-3 w-3" /> Bas
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800">
            OK
          </span>
        )}
      </td>

      <td className="p-3 text-right">
        <div className="flex justify-end gap-1">
          {enEdition ? (
            <>
              <Bouton
                variante="succes"
                taille="iconeCarree"
                onClick={sauvegarder}
                disabled={desactive}
                title="Enregistrer"
                aria-label="Enregistrer"
              >
                <Save className="h-3.5 w-3.5" />
              </Bouton>
              <Bouton
                variante="neutre"
                taille="iconeCarree"
                onClick={() => setEnEdition(false)}
                title="Annuler"
                aria-label="Annuler"
              >
                <X className="h-3.5 w-3.5" />
              </Bouton>
            </>
          ) : (
            <>
              <Bouton
                variante="neutre"
                taille="iconeCarree"
                onClick={demarrerEdition}
                title="Modifier manuellement"
                aria-label="Modifier manuellement"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Bouton>
              <Bouton
                variante="danger"
                taille="iconeCarree"
                onClick={() => onSupprimer(stock)}
                title="Supprimer"
                aria-label="Supprimer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Bouton>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};