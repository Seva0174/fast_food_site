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
    <tr className={`transition hover:bg-muted/40 ${enAlerte ? 'bg-destructive/5' : ''}`}>
      <td className="p-3 font-bold text-muted-foreground">#{stock.id}</td>
      <td className="p-3 font-semibold text-foreground">{stock.nom}</td>

      <td className="p-3">
        {enEdition ? (
          <input
            type="number"
            step="0.01"
            value={quantite}
            onChange={(e) => setQuantite(e.target.value)}
            className="w-24 rounded-lg border border-input bg-transparent p-1 text-xs font-semibold tabular-nums"
          />
        ) : (
          <span className="text-sm font-bold text-foreground">{formaterQuantite(stock.quantite)}</span>
        )}
      </td>

      <td className="p-3">
        {enEdition ? (
          <ListeDeroulante
            valeur={unite}
            onChange={setUnite}
            options={UNITES}
            className="min-w-[7rem] rounded-lg border border-input p-1 text-xs font-medium"
            classeItem="text-xs"
          />
        ) : (
          <span className="font-medium text-muted-foreground">{stock.uniteMesure}</span>
        )}
      </td>

      <td className="p-3 text-center">
        {enAlerte ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
            <AlertTriangle className="h-3 w-3" aria-hidden="true" /> Bas
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            OK
          </span>
        )}
      </td>

      <td className="p-3 text-right">
        <div className="flex justify-end gap-1">
          {enEdition ? (
            <>
              <Bouton
                variante="principal"
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
                variante="fantomeDanger"
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