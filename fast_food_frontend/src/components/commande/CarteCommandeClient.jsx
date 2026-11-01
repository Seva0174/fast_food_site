import { ChevronRight, RefreshCw, Store, Truck } from 'lucide-react';
import { BadgeStatutCommande } from './BadgeStatutCommande';
import { SuiviCommande } from './SuiviCommande';
import { formaterPrix } from '../../lib/prix';
import { libelleRecommande } from '../../lib/recommande';
import {
  estClickAndCollect,
  estEnCours,
  estRecente,
  heureCommande,
  momentCommande,
  nombreArticles,
} from '../../lib/commande';

// Carte d'une commande du client. Le bouton du titre est etire sur toute la carte
// (after:inset-0) : toute la carte ouvre le detail, sans liste dans un bouton.
// enAvant : commande suivie depuis le ticket. Si elle est recente, la carte reprend le ticket.
// recommande / onRecommander : action rapide sur une commande terminee (voir lib/recommande).
export const CarteCommandeClient = ({
  commande,
  enAvant = false,
  onDetails,
  recommande,
  onRecommander,
  recommandeEnCours = false,
  ref,
}) => {
  const clickAndCollect = estClickAndCollect(commande);
  const IconeMode = clickAndCollect ? Store : Truck;
  const articles = nombreArticles(commande);
  const enCours = estEnCours(commande);
  const faconTicket = enAvant && estRecente(commande);
  const peutRecommander = !enCours && recommande && onRecommander;

  return (
    <article
      ref={ref}
      className={`relative scroll-mt-24 rounded-2xl border bg-card p-4 transition-colors hover:border-muted-foreground/60 sm:p-5 ${
        enAvant ? 'border-primary hover:border-primary' : 'border-border'
      }`}
    >
      {faconTicket && (
        <p className="mb-3 border-b border-dashed border-border pb-3 text-sm font-semibold text-primary">
          Reçue à {heureCommande(commande)}
        </p>
      )}

      <div className="flex items-start justify-between gap-4">
        <h3 className={`titre-marque ${faconTicket ? 'text-4xl' : 'text-2xl'}`}>
          <button
            type="button"
            onClick={onDetails}
            className="cursor-pointer text-left uppercase after:absolute after:inset-0 after:rounded-2xl after:content-['']"
          >
            Commande n°{commande.id}
          </button>
        </h3>
        <span className="shrink-0 text-lg font-extrabold tabular-nums">{formaterPrix(commande.total)}</span>
      </div>

      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span>{momentCommande(commande)}</span>
        <span className="inline-flex items-center gap-1">
          <IconeMode className="h-4 w-4" aria-hidden="true" />
          {clickAndCollect ? 'Click & collect' : 'Livraison'}
        </span>
        <span>
          {articles} article{articles > 1 ? 's' : ''}
        </span>
      </p>

      {/* En cours : le suivi est le statut. Terminee : badge + action rapide "Recommander". */}
      <div className="mt-4">
        {enCours ? (
          <SuiviCommande commande={commande} />
        ) : (
          <BadgeStatutCommande statut={commande.status} typeRetrait={commande.typeRetrait} />
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        {peutRecommander ? (
          // z-10 : au-dessus du bouton etire, ce bouton garde son propre clic
          <button
            type="button"
            onClick={onRecommander}
            disabled={recommande.articles.length === 0 || recommandeEnCours}
            className="relative z-10 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-secondary px-3 text-sm font-semibold transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {recommandeEnCours ? 'Ajout au panier…' : libelleRecommande(recommande)}
          </button>
        ) : (
          <span />
        )}
        <span className="flex items-center gap-1 text-sm font-semibold text-muted-foreground" aria-hidden="true">
          Détail
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </article>
  );
};
