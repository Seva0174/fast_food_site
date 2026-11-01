import { estClickAndCollect, etapeSuivi, etapesSuivi } from '../../lib/commande';

// Suivi d'une commande en cours : trois etapes.
// Etapes franchies en creme ; l'orange est reserve a "Prête à retirer" (le client doit venir).
// En livraison, le client n'a rien a faire : la derniere etape reste en creme.
export const SuiviCommande = ({ commande }) => {
  const atteinte = etapeSuivi(commande);
  if (atteinte < 0) return null;
  const etapes = etapesSuivi(commande);
  const derniere = etapes.length - 1;
  const aAgir = estClickAndCollect(commande);

  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Suivi de la commande">
      {etapes.map((libelle, index) => {
        const faite = index <= atteinte;
        const courante = index === atteinte;
        let couleur = 'bg-muted-foreground/35';
        if (faite) couleur = index === derniere && aAgir ? 'bg-primary' : 'bg-foreground/80';
        return (
          <li key={libelle} aria-current={courante ? 'step' : undefined}>
            <span className={`block h-1.5 rounded-full ${couleur}`} aria-hidden="true" />
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
