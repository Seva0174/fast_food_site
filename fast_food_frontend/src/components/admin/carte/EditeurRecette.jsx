import { useState } from 'react';
import { X } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { ListeDeroulante } from '@/components/ui/liste';
import { ajouterIngredient, erreurIngredient, retirerIngredient } from '@/lib/carte';

const classeChamp =
  'w-full rounded border px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-red-500';

// Recette d'un produit : ingrédients du stock et quantités requises.
// onChange reçoit la nouvelle recette à chaque ajout ou retrait.
export const EditeurRecette = ({ recette, matieresPremieres, onChange }) => {
  const [idMatiere, setIdMatiere] = useState('');
  const [quantite, setQuantite] = useState('1');
  const [erreur, setErreur] = useState('');

  const ajouter = () => {
    const matiere = matieresPremieres.find((m) => String(m.id) === idMatiere);
    const quantiteSaisie = parseFloat(quantite);
    const messageErreur = erreurIngredient(matiere, quantiteSaisie);
    setErreur(messageErreur ?? '');
    if (messageErreur) return;

    onChange(ajouterIngredient(recette, matiere, quantiteSaisie));
    setIdMatiere('');
    setQuantite('1');
  };

  return (
    <div className="space-y-3 rounded-lg border bg-gray-50 p-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Composition (Recette)</h4>
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
          {recette.length} ingrédient(s)
        </span>
      </div>

      <div className="space-y-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Ingrédient du stock</label>
          <ListeDeroulante
            valeur={idMatiere}
            onChange={setIdMatiere}
            options={matieresPremieres.map((m) => ({ value: m.id, label: m.nom }))}
            placeholder="-- Sélectionner une matière première --"
            className="w-full rounded border bg-white px-2.5 py-1.5 text-xs"
            classeItem="text-xs"
          />
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-600">Quantité requise</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              onKeyDown={(e) => {
                // Entrée ajoute l'ingrédient au lieu d'enregistrer le produit
                if (e.key === 'Enter') {
                  e.preventDefault();
                  ajouter();
                }
              }}
              className={classeChamp}
            />
          </div>
          <Bouton taille="xs" className="py-1.5" onClick={ajouter}>
            + Ajouter
          </Bouton>
        </div>

        {erreur && <p className="text-xs font-medium text-red-600">{erreur}</p>}
      </div>

      <div className="overflow-hidden rounded border bg-white">
        {recette.length === 0 ? (
          <p className="py-6 text-center text-xs text-gray-400">Aucun ingrédient associé à ce produit.</p>
        ) : (
          <ul className="divide-y text-xs">
            {recette.map((ingredient) => (
              <li
                key={ingredient.idMatiere}
                className="flex items-center justify-between px-3 py-2 hover:bg-gray-50"
              >
                <div>
                  <span className="font-semibold text-gray-800">{ingredient.nomMatiere}</span>
                  <span className="ml-2 text-gray-500">
                    x {ingredient.quantiteRequise} {ingredient.uniteMesure}
                  </span>
                </div>
                <Bouton
                  variante="lien"
                  taille="nu"
                  className="px-1"
                  onClick={() => onChange(retirerIngredient(recette, ingredient.idMatiere))}
                  title="Retirer cet ingrédient"
                  aria-label="Retirer cet ingrédient"
                >
                  <X className="h-4 w-4" />
                </Bouton>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};