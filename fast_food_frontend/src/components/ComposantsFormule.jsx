// Liste compacte des produits choisis dans un menu (panier et recapitulatif de commande)
export const ComposantsFormule = ({ composants, className = '' }) => {
  if (!composants || composants.length === 0) return null;

  return (
    <ul className={`mt-1 space-y-0.5 ${className}`}>
      {composants.map((composant, index) => {
        const options = (composant.options || [])
          .map((opt) => opt.nom || opt.nomOption)
          .filter(Boolean);
        const supplement = Number(composant.supplement || 0);

        return (
          <li
            key={`${composant.idGroupe}-${composant.produitId}-${index}`}
            className="text-[11px] text-gray-500 leading-snug"
          >
            {composant.nomGroupe && (
              <span className="text-gray-400">{composant.nomGroupe} : </span>
            )}
            <span className="font-medium text-gray-600">{composant.nom}</span>
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