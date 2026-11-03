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
    <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-3">
      <div className="space-y-2 md:col-span-2">
        <label className="block text-sm font-medium text-muted-foreground">Sélectionner un fournisseur</label>
        <div className="flex gap-2">
          <ListeDeroulante
            valeur={idSelectionne}
            onChange={onSelectionner}
            options={fournisseurs.map((f) => ({ value: f.id, label: f.nom }))}
            placeholder="Choisir un fournisseur"
            className="w-full rounded-lg border border-input p-2 text-sm font-medium"
          />
          {idSelectionne && (
            <Bouton
              variante="fantomeDanger"
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
        <label className="block text-sm font-medium text-muted-foreground">Nouveau fournisseur</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nom du fournisseur"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full rounded-lg border border-input bg-transparent p-2 text-sm placeholder:text-muted-foreground"
          />
          <Bouton type="submit" variante="secondaire" taille="sm" disabled={chargement} aria-label="Créer le fournisseur">
            <Plus className="h-4 w-4" />
          </Bouton>
        </div>
      </form>
    </div>
  );
};