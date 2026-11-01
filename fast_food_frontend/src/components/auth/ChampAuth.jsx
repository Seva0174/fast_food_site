// Champ de formulaire avec icone, utilise par la page de connexion et d'inscription.
export const ChampAuth = ({
  libelle,
  icone: Icone,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  autoFocus = false,
}) => (
  <div>
    <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
      {libelle}
    </label>
    <div className="relative">
      <Icone
        className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        id={name}
        type={type}
        name={name}
        required
        value={value}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-input bg-background/60 py-3 pl-10 pr-4 text-base text-foreground transition-colors placeholder:text-muted-foreground focus-visible:border-primary sm:text-sm"
      />
    </div>
  </div>
);
