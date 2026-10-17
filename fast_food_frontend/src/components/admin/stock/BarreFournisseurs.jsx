import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { ListeDeroulante } from '@/components/ui/liste';

// Choix du fournisseur courant (avec suppression) et formulaire de création d'un fournisseur.
export const BarreFournisseurs = ({
  fournisseurs,
  idSelectionne,
  chargement,
  onSelectionner,
  onCreer,
  onSupprimer,
}) => {
  const [nom, setNom] = useState('');

  const soumettre = async (e) => {
    e.preventDefault();
    if (await onCreer(nom)) setNom('');
  };

  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-3">
      <div className="space-y-2 md:col-span-2">
        <label className="block text-xs font-semibold text-gray-700">Sélectionner un Fournisseur</label>
        <div className="flex gap-2">
          <ListeDeroulante
            valeur={idSelectionne}
            onChange={onSelectionner}
            options={fournisseurs.map((f) => ({ value: f.id, label: f.nom }))}
            placeholder="-- Choisir un fournisseur --"
            className="w-full rounded-lg border-gray-300 bg-white p-2 text-sm font-medium"
          />
          {idSelectionne && (
            <Bouton
              variante="danger"
              taille="nu"
              className="p-2"
              onClick={() => onSupprimer(idSelectionne)}
              title="Supprimer ce fournisseur"
              aria-label="Supprimer ce fournisseur"
            >
              <Trash2 className="h-5 w-5" />
            </Bouton>
          )}
        </div>
      </div>

      <form onSubmit={soumettre} className="space-y-2">
        <label className="block text-xs font-semibold text-gray-700">Nouveau Fournisseur</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nom du fournisseur"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm focus:ring-2 focus:ring-red-500"
          />
          <Bouton type="submit" taille="sm" disabled={chargement} aria-label="Créer le fournisseur">
            <Plus className="h-4 w-4" />
          </Bouton>
        </div>
      </form>
    </div>
  );
};