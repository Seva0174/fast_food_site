const styleFiltre = (actif) =>
  `whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition ${
    actif
      ? 'bg-red-600 text-white shadow'
      : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
  }`;

export const FiltresCategories = ({ categories, categorieActive, onChange }) => (
  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
    <button type="button" onClick={() => onChange(null)} className={styleFiltre(categorieActive === null)}>
      Tous les produits
    </button>

    {categories.map((cat) => (
      <button
        key={cat.id}
        type="button"
        onClick={() => onChange(cat.id)}
        className={styleFiltre(categorieActive === cat.id)}
      >
        {cat.nom}
      </button>
    ))}
  </div>
);