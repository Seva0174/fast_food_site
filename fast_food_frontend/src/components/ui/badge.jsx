const variantes = {
  accent: 'bg-primary text-primary-foreground',
  discret: 'bg-background/80 text-foreground backdrop-blur-sm',
};

// Les classes de padding se passent via className.
export const Badge = ({ children, variante = 'accent', className = '' }) => (
  <span
    className={`inline-flex items-center rounded-full text-xs font-bold ${variantes[variante]} ${className}`}
  >
    {children}
  </span>
);