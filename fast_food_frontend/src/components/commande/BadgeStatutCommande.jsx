import { Clock, ChefHat, BellRing, CheckCircle2, XCircle, CircleHelp } from 'lucide-react';
import { LIBELLES_STATUT, STATUT_COMMANDE } from '../../lib/commande';

// Une seule couleur d'accent : l'orange marque la commande prete (le client doit agir).
// Les autres statuts restent sur les paliers neutres du theme, l'icone fait la difference.
const STYLES = {
  [STATUT_COMMANDE.EN_ATTENTE]: { classes: 'border-border bg-secondary text-foreground', icone: Clock },
  [STATUT_COMMANDE.EN_PREPARATION]: { classes: 'border-border bg-secondary text-foreground', icone: ChefHat },
  [STATUT_COMMANDE.PRETE]: { classes: 'border-transparent bg-primary text-primary-foreground', icone: BellRing },
  [STATUT_COMMANDE.LIVREE]: { classes: 'border-border bg-transparent text-muted-foreground', icone: CheckCircle2 },
  [STATUT_COMMANDE.RETIREE]: { classes: 'border-border bg-transparent text-muted-foreground', icone: CheckCircle2 },
  [STATUT_COMMANDE.ANNULEE]: { classes: 'border-destructive/40 bg-destructive/10 text-destructive', icone: XCircle },
};

// Statut inconnu (nouvelle valeur cote backend) : affiche tel quel au lieu de planter
const STYLE_INCONNU = { classes: 'border-border bg-secondary text-foreground', icone: CircleHelp };

export const BadgeStatutCommande = ({ statut }) => {
  const { classes, icone: Icone } = STYLES[statut] ?? STYLE_INCONNU;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold ${classes}`}
    >
      <Icone className="h-3.5 w-3.5" aria-hidden="true" />
      {LIBELLES_STATUT[statut] ?? statut}
    </span>
  );
};
