import { useState } from 'react';
import { Bouton } from '@/components/ui/bouton';
import { ListeDeroulante } from '@/components/ui/liste';
import { FORMULAIRE_PRODUIT_FORMULE_VIDE } from '@/lib/formule';

// Formulaire d'ajout d'un produit dans un emplacement. Les produits sont classés par catégorie.
// onSoumettre reçoit le formulaire et renvoie true si le produit a été ajouté.
export const FormulaireProduitFormule = ({ categories, titre, onSoumettre, onAnnuler }) => {
  const [formulaire, setFormulaire] = useState(FORMULAIRE_PRODUIT_FORMULE_VIDE);

  const soumettre = async (e) => {
    e.preventDefault();
    if (await onSoumettre(formulaire)) onAnnuler();
  };

  return (
    <form
      onSubmit={soumettre}
      className="mt-2 space-y-2 rounded-md border border-red-200 bg-red-50/50 p-3"
    >
      <h5 className="text-[11px] font-bold uppercase text-red-800">{titre}</h5>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="mb-0.5 block text-[10px] font-medium text-gray-600">Produit</label>
          <ListeDeroulante
            valeur={formulaire.idProduit}
            onChange={(idProduit) => setFormulaire({ ...formulaire, idProduit })}
            groupes={categories}
            placeholder="-- Sélectionner --"
            className="w-full bg-white px-2 py-1 text-xs"
            classeItem="text-xs"
          />
        </div>
        <div>
          <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
            Surcoût dans le menu (€)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formulaire.surcout}
            onChange={(e) => setFormulaire({ ...formulaire, surcout: e.target.value })}
            className="w-full rounded border bg-white px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Bouton variante="secondaire" taille="xs" onClick={onAnnuler}>
          Annuler
        </Bouton>
        <Bouton type="submit" taille="xs">
          Ajouter le produit
        </Bouton>
      </div>
    </form>
  );
};