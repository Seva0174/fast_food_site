import { useId, useState } from 'react';
import { Bouton } from '@/components/ui/bouton';
import { ListeDeroulante } from '@/components/ui/liste';
import { UNITES, UNITE_PAR_DEFAUT } from '@/lib/stock';

const classeChamp =
  'w-full min-h-10 rounded-lg border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50';
const classeLabel = 'mb-1 block text-sm font-medium text-muted-foreground';

// Formulaire d'ajout d'une matière première. Les champs se réinitialisent à chaque ouverture.
export const FormulaireAjoutStock = ({ enCours, onAjouter, onFermer }) => {
  const id = useId();
  const [nom, setNom] = useState('');
  const [quantite, setQuantite] = useState('0');
  const [uniteMesure, setUniteMesure] = useState(UNITE_PAR_DEFAUT);

  const soumettre = async (e) => {
    e.preventDefault();
    const reussi = await onAjouter({ nom, quantite: Number(quantite), uniteMesure });
    if (reussi) onFermer();
  };

  return (
    <form
      onSubmit={soumettre}
      // Échap ferme le formulaire (les options d'une liste ouverte sont dans un portail : Échap ferme alors la liste)
      onKeyDown={(e) => {
        if (e.key === 'Escape' && e.currentTarget.contains(e.target) && !e.defaultPrevented) onFermer();
      }}
      aria-labelledby={`${id}-titre`}
      className="space-y-4 rounded-xl border border-border bg-card p-4"
    >
      <h4 id={`${id}-titre`} className="font-semibold text-foreground">
        Nouvelle matière première
      </h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <label htmlFor={`${id}-nom`} className={classeLabel}>
            Nom
          </label>
          <input
            id={`${id}-nom`}
            type="text"
            autoFocus
            autoComplete="off"
            placeholder="ex : Steak 150 g"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className={classeChamp}
            required
          />
        </div>
        <div>
          <label htmlFor={`${id}-quantite`} className={classeLabel}>
            Quantité en stock
          </label>
          <input
            id={`${id}-quantite`}
            type="number"
            min="0"
            step="0.01"
            value={quantite}
            onChange={(e) => setQuantite(e.target.value)}
            className={`${classeChamp} tabular-nums`}
            required
          />
        </div>
        <div>
          <label htmlFor={`${id}-unite`} className={classeLabel}>
            Unité
          </label>
          <ListeDeroulante
            id={`${id}-unite`}
            valeur={uniteMesure}
            onChange={setUniteMesure}
            options={UNITES}
            className="min-h-10 w-full rounded-lg border border-input px-3 text-sm"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Bouton variante="secondaire" taille="sm" onClick={onFermer}>
          Annuler
        </Bouton>
        <Bouton type="submit" taille="sm" disabled={enCours}>
          Enregistrer
        </Bouton>
      </div>
    </form>
  );
};
