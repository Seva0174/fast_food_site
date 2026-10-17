import { useState } from 'react';
import { Bouton } from '@/components/ui/bouton';
import { ListeDeroulante } from '@/components/ui/liste';
import { UNITES, UNITE_PAR_DEFAUT } from '@/lib/stock';

// Formulaire d'ajout d'une matière première. Les champs se réinitialisent à chaque ouverture.
export const FormulaireAjoutStock = ({ chargement, onAjouter, onFermer }) => {
  const [nom, setNom] = useState('');
  const [quantite, setQuantite] = useState('0');
  const [uniteMesure, setUniteMesure] = useState(UNITE_PAR_DEFAUT);

  const soumettre = async (e) => {
    e.preventDefault();
    const reussi = await onAjouter({ nom, quantite: Number(quantite), uniteMesure });
    if (reussi) onFermer();
  };

  return (
    <form onSubmit={soumettre} className="space-y-3 rounded-xl border bg-gray-50 p-4">
      <h4 className="text-xs font-bold text-gray-700">Nouvelle Matière Première</h4>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <input
          type="text"
          placeholder="Nom (ex: Steak 150g)"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="rounded-lg border p-2 text-xs"
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Quantité initiale"
          value={quantite}
          onChange={(e) => setQuantite(e.target.value)}
          className="rounded-lg border p-2 text-xs"
          required
        />
        <ListeDeroulante
          valeur={uniteMesure}
          onChange={setUniteMesure}
          options={UNITES}
          className="rounded-lg border bg-white p-2 text-xs"
          classeItem="text-xs"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Bouton variante="neutre" taille="xs" onClick={onFermer}>
          Annuler
        </Bouton>
        <Bouton type="submit" variante="succes" taille="xs" disabled={chargement}>
          Enregistrer
        </Bouton>
      </div>
    </form>
  );
};