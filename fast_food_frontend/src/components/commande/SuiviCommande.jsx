import { etapeSuivi, etapesSuivi } from '../../lib/commande';

// Suivi d'une commande en cours : trois etapes, l'etape atteinte est marquee en orange.
export const SuiviCommande = ({ commande }) => {
  const atteinte = etapeSuivi(commande);
  if (atteinte < 0) return null;
  const etapes = etapesSuivi(commande);

  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Suivi de la commande">
      {etapes.map((libelle, index) => {
        const faite = index <= atteinte;
        const courante = index === atteinte;
        return (
          <li key={libelle} aria-current={courante ? 'step' : undefined}>
            <span
              className={`block h-1.5 rounded-full ${faite ? 'bg-primary' : 'bg-accent'}`}
              aria-hidden="true"
            />
            <span
              className={`mt-1.5 block text-xs ${
                courante ? 'font-semibold text-foreground' : 'text-muted-foreground'
              }`}
            >
              {libelle}
              {faite && !courante && <span className="sr-only"> (terminée)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
};
