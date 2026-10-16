import { Clock, Package, CheckCircle, AlertCircle } from 'lucide-react';
import { LIBELLES_STATUT, STATUT_COMMANDE } from '../../lib/commande';

const STYLES = {
  [STATUT_COMMANDE.EN_ATTENTE]: { classes: 'bg-amber-100 text-amber-800', icone: Clock },
  [STATUT_COMMANDE.EN_PREPARATION]: { classes: 'bg-blue-100 text-blue-800', icone: Package },
  [STATUT_COMMANDE.PRETE]: { classes: 'bg-purple-100 text-purple-800', icone: CheckCircle },
  [STATUT_COMMANDE.LIVREE]: { classes: 'bg-emerald-100 text-emerald-800', icone: CheckCircle },
  [STATUT_COMMANDE.RETIREE]: { classes: 'bg-teal-100 text-teal-800', icone: CheckCircle },
  [STATUT_COMMANDE.ANNULEE]: { classes: 'bg-red-100 text-red-800', icone: AlertCircle },
};

export const BadgeStatutCommande = ({ statut }) => {
  const { classes, icone: Icone } = STYLES[statut];

  return (
    <span
      className={`${classes} text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1`}
    >
      <Icone className="w-3.5 h-3.5" /> {LIBELLES_STATUT[statut]}
    </span>
  );
};