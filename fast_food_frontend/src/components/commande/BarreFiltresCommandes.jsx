import { Search, Truck, Store, ArrowUpDown } from 'lucide-react';
import { Bouton } from '../ui/bouton';
import { FILTRE_STATUT, FILTRE_TYPE_TOUS, LIBELLES_STATUT, STATUTS_FILTRABLES, TYPE_RETRAIT } from '../../lib/commande';

// Bouton de filtre : actif en orange (accent du theme), inactif en gris
const Pastille = ({ actif, onClick, children }) => (
  <Bouton
    variante={actif ? 'principal' : 'neutre'}
    taille="xs"
    className="whitespace-nowrap rounded-full"
    aria-pressed={actif}
    onClick={onClick}
  >
    {children}
  </Bouton>
);

export const BarreFiltresCommandes = ({ filtres, onChange, ordre, onChangerOrdre, compteurs }) => (
  <div className="mb-6 space-y-4 rounded-xl border border-border bg-card p-4">
    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
      <div className="relative w-full md:w-72">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="text"
          aria-label="Rechercher une commande"
          placeholder="N° de commande, client..."
          value={filtres.recherche}
          onChange={(e) => onChange('recherche', e.target.value)}
          className="w-full rounded-lg border border-input bg-transparent py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="flex w-full flex-wrap items-center justify-between gap-3 md:w-auto md:justify-end">
        <div className="flex items-center gap-1">
          <Pastille
            actif={filtres.typeRetrait === FILTRE_TYPE_TOUS}
            onClick={() => onChange('typeRetrait', FILTRE_TYPE_TOUS)}
          >
            Tous
          </Pastille>
          <Pastille
            actif={filtres.typeRetrait === TYPE_RETRAIT.LIVRAISON}
            onClick={() => onChange('typeRetrait', TYPE_RETRAIT.LIVRAISON)}
          >
            <Truck className="h-3.5 w-3.5" aria-hidden="true" /> Livraison
          </Pastille>
          <Pastille
            actif={filtres.typeRetrait === TYPE_RETRAIT.CLICK_AND_COLLECT}
            onClick={() => onChange('typeRetrait', TYPE_RETRAIT.CLICK_AND_COLLECT)}
          >
            <Store className="h-3.5 w-3.5" aria-hidden="true" /> Retrait
          </Pastille>
        </div>

        <Bouton variante="secondaire" taille="sm" onClick={onChangerOrdre}>
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          {ordre === 'desc' ? 'Plus récentes en premier' : 'Plus anciennes en premier'}
        </Bouton>
      </div>
    </div>

    <div className="flex items-center gap-2 overflow-x-auto border-t border-border pb-1 pt-3">
      <Pastille
        actif={filtres.statut === FILTRE_STATUT.EN_COURS}
        onClick={() => onChange('statut', FILTRE_STATUT.EN_COURS)}
      >
        En cours ({compteurs.enCours})
      </Pastille>

      {STATUTS_FILTRABLES.map((statut) => (
        <Pastille
          key={statut}
          actif={filtres.statut === statut}
          onClick={() => onChange('statut', statut)}
        >
          {LIBELLES_STATUT[statut]} ({compteurs.parStatut[statut]})
        </Pastille>
      ))}

      <Pastille
        actif={filtres.statut === FILTRE_STATUT.TERMINEES}
        onClick={() => onChange('statut', FILTRE_STATUT.TERMINEES)}
      >
        Terminées / Historique ({compteurs.terminees})
      </Pastille>
    </div>
  </div>
);
