const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';

// Les variantes s'appuient sur les variables du theme (index.css).
// Les noms sont conserves pour ne rien casser dans l'admin.
const variantes = {
  principal: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondaire: 'border border-border bg-secondary text-secondary-foreground hover:bg-accent',
  danger: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
  fantome: 'text-muted-foreground hover:bg-accent hover:text-foreground',
  succes: 'bg-green-600 text-white hover:bg-green-500',
  neutre: 'bg-muted text-secondary-foreground hover:bg-accent',
  lien: 'text-primary hover:underline',
  discret: 'text-muted-foreground hover:underline',
  sombre: 'bg-foreground text-background hover:bg-foreground/90',
  info: 'bg-blue-600 text-white hover:bg-blue-500',
  contour: 'border border-primary/40 bg-transparent text-primary hover:border-primary hover:bg-primary/10',
  lienInfo: 'text-blue-500 hover:underline',
  succesDoux: 'bg-green-500/15 text-green-500 hover:bg-green-500/25',
  dangerDoux: 'bg-destructive/15 text-destructive hover:bg-destructive/25',
  contourInfo: 'border border-blue-500/40 text-blue-500 hover:border-blue-500',
  contourAccent: 'border border-purple-500/40 text-purple-500 hover:border-purple-500',
};

const tailles = {
  xs: 'px-2.5 py-1 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-4 py-3.5 text-base',
  icone: 'rounded-full p-1',
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