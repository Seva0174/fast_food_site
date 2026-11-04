import { useId, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { ListeDeroulante } from '@/components/ui/liste';
import { useRetourFocus } from '@/hooks/useRetourFocus';
import { resumerBon } from '@/lib/approvisionnement';

const classeLabel = 'mb-1 block text-sm font-medium text-muted-foreground';

// Choix du fournisseur courant (avec suppression). La création d'un fournisseur s'ouvre à la demande ;
// sans aucun fournisseur, elle est ouverte d'office avec une explication.
// bons : bons de commande en cours par fournisseur, rappelés sous leur nom dans la liste.
export const BarreFournisseurs = ({
  fournisseurs,
  idSelectionne,
  bons,
  enCours,
  onSelectionner,
  onCreer,
  onSupprimer,
}) => {
  const id = useId();
  const [creationOuverte, setCreationOuverte] = useState(false);
  const boutonCreation = useRetourFocus(creationOuverte);
  const aucun = fournisseurs.length === 0;

  if (aucun) {
    return (
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Aucun fournisseur pour le moment. Crée-en un pour importer son catalogue, puis passer commande.
        </p>
        <FormulaireFournisseur enCours={enCours} onCreer={onCreer} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="w-full sm:w-80">
          <label htmlFor={`${id}-fournisseur`} className={classeLabel}>
            Fournisseur
          </label>
          <div className="flex gap-2">
            <ListeDeroulante
              id={`${id}-fournisseur`}
              valeur={idSelectionne}
              onChange={onSelectionner}
              options={fournisseurs.map((f) => ({
                value: f.id,
                label: f.nom,
                description: bons[f.id]?.length ? resumerBon(bons[f.id]) : undefined,
              }))}
              placeholder="Choisir un fournisseur"
              className="min-h-10 w-full rounded-lg border border-input px-3 text-sm font-medium"
            />
            {idSelectionne && (
              <Bouton
                variante="fantomeDanger"
                taille="nu"
                className="size-10 shrink-0"
                onClick={() => onSupprimer(idSelectionne)}
                disabled={enCours}
                title="Supprimer ce fournisseur"
                aria-label="Supprimer ce fournisseur"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Bouton>
            )}
          </div>
        </div>

        {!creationOuverte && (
          <Bouton ref={boutonCreation} variante="secondaire" taille="sm" onClick={() => setCreationOuverte(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nouveau fournisseur
          </Bouton>
        )}
      </div>

      {creationOuverte && (
        <div className="rounded-xl border border-border bg-card p-4">
          <FormulaireFournisseur
            enCours={enCours}
            onCreer={async (nom) => {
              const cree = await onCreer(nom);
              if (cree) setCreationOuverte(false);
              return cree;
            }}
            onAnnuler={() => setCreationOuverte(false)}
          />
        </div>
      )}
    </div>
  );
};

// Nom du nouveau fournisseur. onCreer renvoie true si le fournisseur a été créé.
const FormulaireFournisseur = ({ enCours, onCreer, onAnnuler }) => {
  const id = useId();
  const [nom, setNom] = useState('');

  const soumettre = async (e) => {
    e.preventDefault();
    if (await onCreer(nom)) setNom('');
  };

  return (
    <form
      onSubmit={soumettre}
      onKeyDown={(e) => e.key === 'Escape' && onAnnuler?.()}
      className="flex flex-wrap items-end gap-2"
    >
      <div className="min-w-0 flex-1 basis-56">
        <label htmlFor={`${id}-nom`} className={classeLabel}>
          Nom du nouveau fournisseur
        </label>
        <input
          id={`${id}-nom`}
          type="text"
          autoFocus={Boolean(onAnnuler)}
          autoComplete="off"
          placeholder="ex : Metro"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          className="min-h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      {onAnnuler && (
        <Bouton variante="secondaire" taille="sm" className="min-h-10" onClick={onAnnuler}>
          Annuler
        </Bouton>
      )}
      <Bouton type="submit" variante="sombre" taille="sm" className="min-h-10" disabled={enCours || !nom.trim()}>
        Créer le fournisseur
      </Bouton>
    </form>
  );
};
