import { ChevronRight, Store, Truck } from 'lucide-react';
import { BadgeStatutCommande } from './BadgeStatutCommande';
import { SuiviCommande } from './SuiviCommande';
import { formaterPrix } from '../../lib/prix';
import { dateCommande, estClickAndCollect, heureCommande, nombreArticles } from '../../lib/commande';

// Carte d'une commande du client. Toute la carte ouvre le detail.
// enAvant : commande qui vient d'etre passee (lien "Suivre ma commande" du ticket).
export const CarteCommandeClient = ({ commande, enAvant = false, onDetails, ref }) => {
  const clickAndCollect = estClickAndCollect(commande);
  const IconeMode = clickAndCollect ? Store : Truck;
  const articles = nombreArticles(commande);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onDetails}
      className={`group w-full scroll-mt-24 rounded-2xl border bg-card p-4 text-left transition-colors hover:border-muted-foreground/60 sm:p-5 ${
        enAvant ? 'border-primary' : 'border-border'
      }`}
    >
      <span className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="flex flex-wrap items-center gap-2.5">
          <span className="text-base font-extrabold">
            <span className="sr-only">Voir le détail de la </span>Commande n°{commande.id}
          </span>
          <BadgeStatutCommande statut={commande.status} />
          {enAvant && (
            <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
              Commande passée à l’instant
            </span>
          )}
        </span>
        <span className="text-lg font-extrabold tabular-nums">{formaterPrix(commande.total)}</span>
      </span>

      <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span>
          Le {dateCommande(commande)} à {heureCommande(commande)}
        </span>
        <span className="inline-flex items-center gap-1">
          <IconeMode className="h-4 w-4" aria-hidden="true" />
          {clickAndCollect ? 'Click & collect' : 'Livraison'}
        </span>
        <span>
          {articles} article{articles > 1 ? 's' : ''}
        </span>
      </span>

      <span className="mt-4 block">
        <SuiviCommande commande={commande} />
      </span>

      <span className="mt-3 flex items-center justify-end gap-1 text-sm font-semibold text-muted-foreground group-hover:text-foreground">
        Détails
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </button>
  );
};
