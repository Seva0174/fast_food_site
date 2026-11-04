import { memo } from 'react';
import { DropdownMenu } from 'radix-ui';
import { ArrowRight, Eye, Loader2, MoreVertical, Store, Truck, Undo2, XCircle } from 'lucide-react';
import { Bouton } from '../ui/bouton';
import { BadgeStatutCommande } from './BadgeStatutCommande';
import { formaterPrix } from '../../lib/prix';
import {
  ancienneteCommande,
  apercuArticles,
  estClickAndCollect,
  estEnCours,
  estEnRetard,
  heureCommande,
  LIBELLES_ACTION_STATUT,
  LIBELLES_STATUT,
  nombreArticles,
  STATUT_COMMANDE,
  statutPrecedent,
  statutSuivant,
} from '../../lib/commande';

const classeItemMenu =
  'flex cursor-default items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-foreground';

// Actions secondaires : revenir d'une etape (erreur de manipulation) ou annuler la commande.
const MenuAutresActions = ({ commande, precedent, onChangerStatut, desactive }) => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>
      <Bouton
        variante="secondaire"
        taille="icone"
        disabled={desactive}
        aria-label={`Autres actions pour la commande ${commande.id}`}
        title="Autres actions"
      >
        <MoreVertical className="h-4 w-4" aria-hidden="true" />
      </Bouton>
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        align="end"
        sideOffset={6}
        className="z-50 min-w-56 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
      >
        {precedent && (
          <DropdownMenu.Item
            className={classeItemMenu}
            onSelect={() => onChangerStatut(commande.id, precedent)}
          >
            <Undo2 className="h-4 w-4" aria-hidden="true" />
            Revenir à « {LIBELLES_STATUT[precedent]} »
          </DropdownMenu.Item>
        )}
        {estEnCours(commande) && (
          <DropdownMenu.Item
            className={`${classeItemMenu} text-destructive`}
            onSelect={() => onChangerStatut(commande.id, STATUT_COMMANDE.ANNULEE)}
          >
            <XCircle className="h-4 w-4" aria-hidden="true" />
            Annuler la commande
          </DropdownMenu.Item>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
);

// nouvelle : commande arrivee depuis l'ouverture de la page et pas encore prise en charge.
// prioritaire : la commande a traiter en premier ; seule son action passe en orange.
export const CommandeCardBase = ({ commande, onChangerStatut, onVoirDetail, enCours, nouvelle, prioritaire }) => {
  const retrait = estClickAndCollect(commande);
  const IconeRetrait = retrait ? Store : Truck;
  const suivant = statutSuivant(commande);
  const precedent = statutPrecedent(commande);
  const articles = nombreArticles(commande);
  const afficherMenu = Boolean(precedent) || estEnCours(commande);
  const retard = estEnRetard(commande);
  const apercu = apercuArticles(commande);

  return (
    <article
      aria-label={`Commande ${commande.id}`}
      className={`flex flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5 ${
        nouvelle ? 'border-primary' : 'border-border'
      }`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <h2 className="titre-marque text-3xl">#{commande.id}</h2>
            {nouvelle && <span className="text-xs font-bold text-primary">Nouvelle</span>}
            {prioritaire && !nouvelle && (
              <span className="text-xs font-semibold text-muted-foreground">À traiter en premier</span>
            )}
          </div>
          <p className="mt-1.5 text-sm tabular-nums text-muted-foreground">
            {heureCommande(commande)} ·{' '}
            <span
              className={
                retard ? 'font-medium text-destructive' : estEnCours(commande) ? 'font-medium text-foreground' : ''
              }
            >
              {ancienneteCommande(commande)}
              {retard && <span className="sr-only"> (en retard)</span>}
            </span>
          </p>
        </div>
        <BadgeStatutCommande statut={commande.status} />
      </header>

      <div className="space-y-1.5">
        <p className="truncate font-semibold" title={commande.nomClient ?? undefined}>
          {commande.nomClient || 'Client inconnu'}
        </p>
        <div className="flex items-end justify-between gap-3">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <IconeRetrait className="h-4 w-4" aria-hidden="true" />
            {retrait ? 'Click & collect' : 'Livraison'} · {articles} article{articles > 1 ? 's' : ''}
          </p>
          <p className="text-xl font-bold tabular-nums">{formaterPrix(commande.total)}</p>
        </div>
      </div>

      {/* Ce qu'il y a a preparer, sans ouvrir le detail */}
      <ul className="space-y-1 text-sm" aria-label={`Articles de la commande ${commande.id}`}>
        {apercu.lignes.map((item) => (
          <li key={item.id} className="flex gap-2">
            <span className="w-7 shrink-0 tabular-nums text-muted-foreground">{item.quantite} ×</span>
            <span className="min-w-0 truncate" title={item.nomProduit}>
              {item.nomProduit}
            </span>
          </li>
        ))}
        {apercu.reste > 0 && (
          <li className="pl-9 text-muted-foreground">
            + {apercu.reste} autre{apercu.reste > 1 ? 's' : ''} ligne{apercu.reste > 1 ? 's' : ''}
          </li>
        )}
      </ul>

      <div className="mt-auto flex items-center gap-2 border-t border-border pt-4">
        {suivant ? (
          <>
            <Bouton
              variante={prioritaire ? 'principal' : 'secondaire'}
              className="min-w-0 flex-1"
              disabled={enCours}
              onClick={() => onChangerStatut(commande.id, suivant)}
            >
              {enCours ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              )}
              {LIBELLES_ACTION_STATUT[suivant]}
            </Bouton>
            <Bouton
              variante="secondaire"
              taille="icone"
              onClick={() => onVoirDetail(commande)}
              aria-label={`Voir le détail de la commande ${commande.id}`}
              title="Voir les détails"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
            </Bouton>
          </>
        ) : (
          <Bouton variante="secondaire" className="flex-1" onClick={() => onVoirDetail(commande)}>
            <Eye className="h-4 w-4" aria-hidden="true" /> Voir les détails
          </Bouton>
        )}
        {afficherMenu && (
          <MenuAutresActions
            commande={commande}
            precedent={precedent}
            onChangerStatut={onChangerStatut}
            desactive={enCours}
          />
        )}
      </div>
    </article>
  );
};

export const CommandeCard = memo(CommandeCardBase);
