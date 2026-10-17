// Champ de formulaire avec icone, utilise par la page de connexion et d'inscription.
export const ChampAuth = ({
  libelle,
  icone: Icone,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {libelle}
    </label>
    <div className="relative">
      <Icone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        id={name}
        type={type}
        name={name}
        required
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm outline-none transition"
      />
    </div>
  </div>
);