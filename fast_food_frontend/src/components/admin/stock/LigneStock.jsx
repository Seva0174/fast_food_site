import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Pencil, Trash2, XCircle } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { ListeDeroulante } from '@/components/ui/liste';
import { ETAT_STOCK, UNITES, etatStock, formaterQuantite } from '@/lib/stock';

const classeChamp =
  'min-h-10 w-full rounded-lg border border-input bg-transparent px-3 text-right text-sm tabular-nums focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50';

const BADGE = 'inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold';

// Épuisé : seul signal plein (texte Noir Suie sur Rouge Alerte, comme dangerPlein) ; bas : contour rouge ;
// suffisant : neutre. L'icône double la couleur.
const BADGES_ETAT = {
  [ETAT_STOCK.EPUISE]: {
    libelle: 'Épuisé',
    icone: XCircle,
    classe: `${BADGE} border-destructive bg-destructive text-background`,
  },
  [ETAT_STOCK.BAS]: {
    libelle: 'Bas',
    icone: AlertTriangle,
    classe: `${BADGE} border-destructive/40 text-destructive`,
  },
  [ETAT_STOCK.OK]: {
    libelle: 'Suffisant',
    icone: null,
    classe: `${BADGE} border-border bg-secondary text-muted-foreground`,
  },
};

// Une ligne du tableau des stocks. Une seule ligne est en édition à la fois (enEdition, piloté par le
// tableau). Édition : Entrée enregistre, Échap annule ; le focus revient ensuite au crayon.
export const LigneStock = ({ stock, enEdition, editionAilleurs, desactive, onEditer, onModifier, onSupprimer }) => {
  const [quantite, setQuantite] = useState('');
  const [unite, setUnite] = useState('');
  const crayon = useRef(null);
  // Vrai quand la ligne termine elle-même son édition (et pas quand une autre ligne la remplace)
  const rendreFocus = useRef(false);
  const etat = BADGES_ETAT[etatStock(stock)];
  const IconeEtat = etat.icone;

  useEffect(() => {
    if (enEdition || !rendreFocus.current) return;
    rendreFocus.current = false;
    crayon.current?.focus();
  }, [enEdition]);

  const terminerEdition = () => {
    rendreFocus.current = true;
    onEditer(null);
  };

  const demarrerEdition = () => {
    setQuantite(String(stock.quantite));
    setUnite(stock.uniteMesure);
    onEditer(stock.id);
  };

  const sauvegarder = async () => {
    const reussi = await onModifier(stock.id, { quantite: Number(quantite), uniteMesure: unite });
    if (reussi) terminerEdition();
  };

  // Échap annule depuis un champ ou un bouton de la ligne (une liste ouverte se ferme d'abord)
  const surToucheLigne = (e) => {
    if (enEdition && e.key === 'Escape' && e.currentTarget.contains(e.target) && !e.defaultPrevented) {
      terminerEdition();
    }
  };

  return (
    <tr onKeyDown={surToucheLigne} className="transition-colors hover:bg-muted/40">
      <th scope="row" className="break-words p-3 text-left font-semibold text-foreground">
        {stock.nom}
      </th>

      <td className="p-3 text-right">
        {enEdition ? (
          <div className="flex justify-end gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              autoFocus
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sauvegarder()}
              aria-label={`Quantité de ${stock.nom}`}
              className={`${classeChamp} max-w-28`}
            />
            <ListeDeroulante
              valeur={unite}
              onChange={setUnite}
              options={UNITES}
              ariaLabel={`Unité de ${stock.nom}`}
              className="min-h-10 min-w-[7.5rem] rounded-lg border border-input px-3 text-sm"
            />
          </div>
        ) : (
          <span className="font-semibold tabular-nums text-foreground">
            {formaterQuantite(stock.quantite, stock.uniteMesure)}
          </span>
        )}
      </td>

      <td className="p-3">
        <span className={etat.classe}>
          {IconeEtat && <IconeEtat className="h-3.5 w-3.5" aria-hidden="true" />}
          {etat.libelle}
        </span>
      </td>

      <td className="p-3">
        <div className="flex justify-end gap-2">
          {enEdition ? (
            <>
              <Bouton variante="secondaire" taille="sm" onClick={terminerEdition}>
                Annuler
              </Bouton>
              <Bouton variante="sombre" taille="sm" onClick={sauvegarder} disabled={desactive}>
                Enregistrer
              </Bouton>
            </>
          ) : (
            <>
              <Bouton
                ref={crayon}
                variante="secondaire"
                taille="nu"
                className="size-9 shrink-0"
                onClick={demarrerEdition}
                disabled={editionAilleurs}
                aria-label={`Modifier le stock de ${stock.nom}`}
                title={editionAilleurs ? 'Termine la modification en cours' : 'Modifier le stock'}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </Bouton>
              <Bouton
                variante="fantomeDanger"
                taille="nu"
                className="size-9 shrink-0"
                onClick={() => onSupprimer(stock)}
                disabled={editionAilleurs}
                aria-label={`Supprimer ${stock.nom}`}
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Bouton>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};
