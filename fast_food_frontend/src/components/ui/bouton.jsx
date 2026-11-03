const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-60';
// aria-disabled (plutôt que disabled) : le bouton reste atteignable au clavier et son explication
// (aria-describedby) est lue ; c'est au onClick d'ignorer le clic.

// Les variantes s'appuient sur les variables du theme (index.css).
const variantes = {
  principal: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondaire: 'border border-border bg-secondary text-secondary-foreground hover:bg-accent',
  // Contour plutôt que fond rouge adouci : le texte rouge garde au moins 4,5:1
  danger: 'border border-destructive/50 text-destructive hover:bg-destructive/10',
  fantome: 'text-muted-foreground hover:bg-accent hover:text-foreground',
  // Icône d'une action destructive : neutre au repos, rouge au survol et au focus. Plusieurs corbeilles
  // rouges au repos noieraient les vrais signaux d'alerte de la page.
  fantomeDanger:
    'text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:text-destructive disabled:text-muted-foreground',
  neutre: 'bg-muted text-secondary-foreground hover:bg-accent',
  lien: 'text-primary hover:underline',
  discret: 'text-muted-foreground hover:underline',
  sombre: 'bg-foreground text-background hover:bg-foreground/90',
  contour: 'border border-primary/40 bg-transparent text-primary hover:border-primary hover:bg-primary/10',
  dangerDoux: 'border border-destructive/50 text-destructive hover:bg-destructive/10',
  // Confirmation d'une action irréversible : fond plein pour un contraste suffisant dans les deux thèmes
  dangerPlein: 'bg-destructive text-background hover:bg-destructive/90',
};

const tailles = {
  xs: 'px-2.5 py-1 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-4 py-3.5 text-base',
  // 44px au doigt, 36px a la souris (lg)
  icone: 'size-11 shrink-0 rounded-full lg:size-9',
  iconeCarree: 'p-1.5',
  pastille: 'rounded-full px-3 py-1 text-xs',
  nu: '',
};

export const Bouton = ({
  variante = 'principal',
  taille = 'md',
  className = '',
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    className={`${base} ${variantes[variante]} ${tailles[taille]} ${className}`}
    {...props}
  />
);