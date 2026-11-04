import { AlertTriangle } from 'lucide-react';
import { Tabs } from 'radix-ui';

// Styles de chaque variante d'onglets. Onglet actif souligné en couleur du texte, comme la navbar
// et le compte client : l'orange reste réservé à l'action principale.
const STYLES = {
  soulignes: {
    // Resserrée sous sm : les quatre onglets de l'administration tiennent sur un téléphone
    liste:
      'flex gap-1 overflow-x-auto overflow-y-hidden scrollbar-none rounded-t-lg border-b border-border bg-card px-2 pt-3 sm:gap-2 sm:px-4',
    onglet:
      '-mb-px shrink-0 whitespace-nowrap border-b-2 border-transparent px-2.5 py-2 text-sm sm:px-4 font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground',
  },
  // Onglets d'une fiche dans l'en-tête d'une modale : le trait de l'onglet actif rejoint la bordure de l'en-tête
  fiche: {
    liste: '-mb-4 mt-3 flex gap-1 overflow-x-auto overflow-y-hidden',
    onglet:
      '-mb-px inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 border-transparent px-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground',
  },
  segments: {
    liste: 'flex w-fit max-w-full overflow-x-auto rounded-lg bg-muted p-1',
    onglet:
      'inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-4 text-sm font-semibold text-muted-foreground transition hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm',
  },
};

// Onglets accessibles (Radix) : flèches gauche/droite et Début/Fin déplacent le focus, Entrée ou Espace
// ouvre l'onglet (activation manuelle : parcourir les onglets ne charge pas chaque vue au passage).
// Onglets enveloppe la liste (ListeOnglets) et les panneaux (PanneauOnglet), où qu'ils soient placés.
export const Onglets = ({ actif, onChange, children }) => (
  <Tabs.Root value={actif} onValueChange={onChange} activationMode="manual">
    {children}
  </Tabs.Root>
);

// Barre d'onglets. Chaque onglet se décrit par { id, libelle, alerte } (alerte : quelque chose est à corriger
// dans cet onglet ; un nombre affiche combien de points sont à traiter, 0 n'affiche rien).
// Variantes : 'soulignes', 'fiche' ou 'segments'.
export const ListeOnglets = ({ onglets, variante = 'soulignes', label }) => {
  const styles = STYLES[variante];
  return (
    <Tabs.List aria-label={label} className={styles.liste}>
      {onglets.map((onglet) => (
        <Tabs.Trigger key={onglet.id} value={onglet.id} className={`${styles.onglet} relative inline-flex items-center gap-1.5`}>
          {onglet.libelle}
          {typeof onglet.alerte === 'number'
            ? onglet.alerte > 0 && (
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
                  {onglet.alerte}
                  <span className="sr-only">à traiter</span>
                </span>
              )
            : onglet.alerte && (
                <>
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
                  <span className="sr-only">(à corriger)</span>
                </>
              )}
        </Tabs.Trigger>
      ))}
    </Tabs.List>
  );
};

// Contenu d'un onglet. garderMonte : le panneau reste dans la page, masqué, quand on change
// d'onglet (son état survit : filtres, formulaire en cours...).
export const PanneauOnglet = ({ id, garderMonte = false, className = '', children }) => (
  <Tabs.Content
    value={id}
    forceMount={garderMonte || undefined}
    className={`outline-none data-[state=inactive]:hidden ${className}`}
  >
    {children}
  </Tabs.Content>
);
