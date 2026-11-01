import { formaterSupplement } from '../../lib/prix';

const libelleOption = (option) => option.nom;

// Liste compacte des produits choisis dans un menu (panier et recapitulatif de commande)
export const ComposantsFormule = ({ composants = [], afficherOptions = true, className = '' }) => {
  if (composants.length === 0) return null;

  return (
    <ul className={`mt-1 space-y-0.5 text-xs leading-snug text-muted-foreground ${className}`}>
      {composants.map((composant) => {
        const options = afficherOptions
          ? (composant.options ?? []).map(libelleOption).filter(Boolean)
          : [];
        const supplement = Number(composant.supplement ?? 0);

        return (
          <li key={`${composant.idGroupe}-${composant.produitId}`}>
            <span className="text-foreground/80">{composant.nom}</span>
            {options.length > 0 && <span> ({options.join(', ')})</span>}
            {supplement > 0 && <span className="tabular-nums"> {formaterSupplement(supplement)}</span>}
          </li>
        );
      })}
    </ul>
  );
};
