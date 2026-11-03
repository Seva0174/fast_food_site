// Interrupteur marche / arrêt (role="switch"). Neutre : l'orange reste réservé à l'action principale.
// children : libellé visible à droite. Sans libellé visible, passer aria-label.
export const Interrupteur = ({ actif, onChange, disabled = false, className = '', children, ...props }) => (
  <button
    type="button"
    role="switch"
    aria-checked={actif}
    disabled={disabled}
    onClick={() => onChange(!actif)}
    className={`inline-flex min-h-9 items-center gap-2 rounded-lg text-sm font-medium disabled:cursor-wait disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 ${className}`}
    {...props}
  >
    <span
      aria-hidden="true"
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors ${
        actif ? 'border-foreground bg-foreground' : 'border-input bg-muted'
      }`}
    >
      <span
        className={`size-3.5 rounded-full transition-transform ${
          actif ? 'translate-x-[18px] bg-background' : 'translate-x-0.5 bg-muted-foreground'
        }`}
      />
    </span>
    {children}
  </button>
);
