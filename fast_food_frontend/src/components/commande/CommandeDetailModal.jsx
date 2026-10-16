import { MapPin, Store, Truck } from 'lucide-react';
import { ModalShell } from '../modales/ModalShell';
import { BadgeStatutCommande } from './BadgeStatutCommande';
import {
  dateLongueCommande,
  estClickAndCollect,
  libellesOptions,
  supplementEmplacement,
} from '../../lib/commande';

// Composition d'un menu : un composant par emplacement
const ComposantsMenu = ({ composants }) => (
  <ul className="mt-2 space-y-1 pl-11">
    {composants.map((composant) => {
      const supplement = supplementEmplacement(composant);
      const options = libellesOptions(composant.options);

      return (
        <li key={composant.id} className="text-xs text-gray-600">
          {/* nomGroupe vaut null si l'emplacement a ete supprime depuis la commande */}
          {composant.nomGroupe && <span className="text-gray-400">{composant.nomGroupe} : </span>}
          <span className="font-medium text-gray-700">{composant.nomProduit}</span>
          {supplement > 0 && <span className="text-gray-500"> (+{supplement.toFixed(2)} €)</span>}
          {options && <span className="text-gray-500"> - {options}</span>}
        </li>
      );
    })}
  </ul>
);

const LigneArticle = ({ item }) => (
  <div className="rounded-lg border border-gray-100 bg-gray-50 p-2.5">
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-3">
        <span className="rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-600">
          x{item.quantite}
        </span>
        <span className="font-medium text-gray-800">{item.nomProduit}</span>
      </div>
      <span className="font-semibold text-gray-900">{Number(item.sousTotal).toFixed(2)} €</span>
    </div>

    {item.composants.length > 0 && <ComposantsMenu composants={item.composants} />}

    {item.options.length > 0 && (
      <p className="mt-1 pl-11 text-xs text-gray-500">
        <span className="font-medium text-gray-600">Options : </span>
        {libellesOptions(item.options)}
      </p>
    )}
  </div>
);

const BadgeMode = ({ clickAndCollect }) =>
  clickAndCollect ? (
    <span className="flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
      <Store className="h-3 w-3" /> Click & Collect
    </span>
  ) : (
    <span className="flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
      <Truck className="h-3 w-3" /> Livraison
    </span>
  );

export const CommandeDetailModal = ({ commande, onClose }) => {
  if (!commande) return null;

  const clickAndCollect = estClickAndCollect(commande);

  return (
    <ModalShell
      titre={`Commande #${commande.id}`}
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
      <section className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
        {clickAndCollect ? (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Store className="h-4 w-4 shrink-0 text-amber-600" />
            <span>À retirer au comptoir du restaurant</span>
          </div>
        ) : (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <div>
              <p className="font-medium text-gray-800">{commande.cpRue}</p>
              <p>
                {commande.cpCodePostal} {commande.cpVille}
              </p>
            </div>
          </div>
        )}
      </section>

      <section>
        <h4 className="mb-3 text-sm font-bold text-gray-800">Articles commandés</h4>
        <div className="space-y-2">
          {commande.items.map((item) => (
            <LigneArticle key={item.id} item={item} />
          ))}
        </div>
      </section>
    </ModalShell>
  );
};