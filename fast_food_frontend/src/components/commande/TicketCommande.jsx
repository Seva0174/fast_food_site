import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { formaterPrix } from '../../lib/prix';
import { TYPE_RETRAIT } from '../../lib/commande';

const libelleRetrait = (commande) =>
  commande.typeRetrait === TYPE_RETRAIT.CLICK_AND_COLLECT
    ? 'Click & collect : à retirer au comptoir quand elle est prête'
    : `Livraison : ${[commande.cpRue, commande.cpCodePostal, commande.cpVille].filter(Boolean).join(', ')}`;

// Ticket affiche apres la validation : resume de la commande renvoyee par le backend.
export const TicketCommande = ({ commande }) => {
  const items = commande.items ?? [];

  return (
    <div className="mx-auto max-w-md">
      <div className="flex items-center gap-2 text-primary">
        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        <p className="text-sm font-semibold">Commande envoyée en cuisine</p>
      </div>

      <h1 className="titre-marque mt-3 text-6xl">Commande n°{commande.id}</h1>

      <section
        aria-label="Récapitulatif de la commande"
        className="mt-6 rounded-2xl border border-border bg-card"
      >
        <p className="border-b border-dashed border-border p-4 text-sm text-muted-foreground">
          {libelleRetrait(commande)}
        </p>

        <ul className="space-y-2 p-4">
          {items.map((item) => (
            <li key={item.id} className="flex items-baseline justify-between gap-4 text-sm">
              <span>
                <span className="tabular-nums text-muted-foreground">{item.quantite} ×</span>{' '}
                {item.nomProduit}
              </span>
              <span className="shrink-0 tabular-nums">{formaterPrix(item.sousTotal)}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-baseline justify-between border-t border-dashed border-border p-4">
          <span className="font-semibold">Total</span>
          <span className="text-2xl font-extrabold tabular-nums">{formaterPrix(commande.total)}</span>
        </div>
      </section>

      <p className="mt-4 text-sm text-muted-foreground">
        Un e-mail de confirmation vous a été envoyé. Vous recevrez un autre e-mail quand la commande
        sera prête.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          to={`/user?commande=${commande.id}`}
          className="inline-flex flex-1 items-center justify-center rounded-lg bg-primary px-4 py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Suivre ma commande
        </Link>
        <Link
          to="/"
          className="inline-flex flex-1 items-center justify-center rounded-lg border border-border bg-secondary px-4 py-3.5 font-semibold transition-colors hover:bg-accent"
        >
          Retour à la carte
        </Link>
      </div>
    </div>
  );
};
