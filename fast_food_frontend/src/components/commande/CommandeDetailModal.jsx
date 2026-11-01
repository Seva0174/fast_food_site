import { MapPin, Store, Truck } from 'lucide-react';
import { ModalShell } from '../modales/ModalShell';
import { BadgeStatutCommande } from './BadgeStatutCommande';
import { formaterPrix, formaterSupplement } from '../../lib/prix';
import {
  dateLongueCommande,
  estClickAndCollect,
  libellesOptions,
  supplementEmplacement,
} from '../../lib/commande';

// Composition d'un menu : un composant par emplacement.
// Couleurs du theme uniquement : la modale sert aussi a la page staff (theme clair temporaire).
const ComposantsMenu = ({ composants }) => (
  <ul className="mt-1.5 space-y-0.5 pl-8 text-xs text-muted-foreground">
    {composants.map((composant) => {
      const supplement = supplementEmplacement(composant);
      const options = libellesOptions(composant.options);

      return (
        <li key={composant.id}>
          {/* nomGroupe vaut null si l'emplacement a ete supprime depuis la commande */}
          {composant.nomGroupe && <span>{composant.nomGroupe} : </span>}
          <span className="font-medium text-foreground">{composant.nomProduit}</span>
          {supplement > 0 && <span className="tabular-nums"> ({formaterSupplement(supplement)})</span>}
          {options && <span> · {options}</span>}
        </li>
      );
    })}
  </ul>
);

const LigneArticle = ({ item }) => (
  <li className="py-2.5">
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span>
        <span className="inline-block w-8 tabular-nums text-muted-foreground">{item.quantite} ×</span>
        <span className="font-medium">{item.nomProduit}</span>
      </span>
      <span className="shrink-0 font-semibold tabular-nums">{formaterPrix(item.sousTotal)}</span>
    </div>

    {item.composants.length > 0 && <ComposantsMenu composants={item.composants} />}

    {item.options.length > 0 && (
      <p className="mt-1 pl-8 text-xs text-muted-foreground">{libellesOptions(item.options)}</p>
    )}
  </li>
);

const BadgeMode = ({ clickAndCollect }) => {
  const Icone = clickAndCollect ? Store : Truck;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground">
      <Icone className="h-3.5 w-3.5" aria-hidden="true" />
      {clickAndCollect ? 'Click & collect' : 'Livraison'}
    </span>
  );
};

export const CommandeDetailModal = ({ commande, onClose }) => {
  if (!commande) return null;

  const clickAndCollect = estClickAndCollect(commande);

  return (
    <ModalShell
      titre={`Commande n°${commande.id}`}
      sousTitre={`Passée le ${dateLongueCommande(commande)}`}
      onClose={onClose}
      enTete={
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <BadgeStatutCommande statut={commande.status} />
          <BadgeMode clickAndCollect={clickAndCollect} />
        </div>
      }
      prixLibelle="Montant total"
      prixTotal={Number(commande.total)}
    >
      <section className="flex items-start gap-2.5 rounded-xl border border-border bg-secondary/40 p-4 text-sm">
        {clickAndCollect ? (
          <>
            <Store className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span>À retirer au comptoir du restaurant</span>
          </>
        ) : (
          <>
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="font-medium">{commande.cpRue}</p>
              <p className="text-muted-foreground">
                {commande.cpCodePostal} {commande.cpVille}
              </p>
            </div>
          </>
        )}
      </section>

      <section>
        <h3 className="text-sm font-bold">Articles commandés</h3>
        <ul className="mt-1 divide-y divide-border">
          {commande.items.map((item) => (
            <LigneArticle key={item.id} item={item} />
          ))}
        </ul>
      </section>
    </ModalShell>
  );
};
