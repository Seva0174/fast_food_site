const libelleOption = (option) => option.nom ?? option.nomOption;

// Liste compacte des produits choisis dans un menu (panier et recapitulatif de commande)
export const ComposantsFormule = ({ composants = [], afficherOptions = true, className = '' }) => {
  if (composants.length === 0) return null;

  return (
    <ul className={`mt-1 space-y-0.5 ${className}`}>
      {composants.map((composant) => {
        const options = afficherOptions
          ? (composant.options ?? []).map(libelleOption).filter(Boolean)
          : [];
        const supplement = Number(composant.supplement ?? 0);

        return (
          <li
            key={`${composant.idGroupe}-${composant.produitId}`}
            className="text-[11px] leading-snug text-gray-500"
          >
            <span className="font-medium text-gray-600">- {composant.nom}</span>
            {options.length > 0 && <span> ({options.join(', ')})</span>}
            {supplement > 0 && (
              <span className="font-semibold text-red-600"> +{supplement.toFixed(2)} €</span>
            )}
          </li>
        );
      })}
    </ul>
  );
};