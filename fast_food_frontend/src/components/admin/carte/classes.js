// Classes et attributs communs aux formulaires de la carte, alignés sur ceux du personnel.

export const classeChamp =
  'w-full min-h-10 rounded-lg border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-destructive/40';

export const classeZoneTexte =
  'w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50';

export const classeLabel = 'mb-1 block text-sm font-medium text-muted-foreground';

export const classeListe = 'w-full min-h-10 rounded-lg border border-input px-3 text-sm';

export const classeBadge =
  'inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground';

// Sous-formulaire posé dans une carte (ajout d'une option, d'un produit dans un emplacement...)
export const classeSousFormulaire = 'space-y-3 rounded-lg border border-border bg-muted/50 p-4';

export const classeTitreSection = 'text-sm font-semibold text-foreground';

export const classeBadgeAlerte =
  'inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-destructive/40 bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive';

// Attributs d'un champ selon son erreur : erreurs est { champ: message }, idBase préfixe les ids.
export const attributsErreur = (erreurs, champ, idBase) => ({
  'aria-invalid': Boolean(erreurs[champ]),
  'aria-describedby': erreurs[champ] ? `${idBase}-erreur-${champ}` : undefined,
});
