import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { Calendrier } from '@/components/ui/calendrier';
import { FenetreCalendrier } from '@/components/ui/fenetre-calendrier';
import {
  aujourdhuiIso,
  decalerMois,
  libelleMois,
  libellePeriode,
  moisDe,
  rangMois,
} from '@/lib/periode';

// Période du détail d'un employé : un mois (navigation ‹ ›) ou une plage libre choisie dans le
// calendrier (« Autre période », le même que celui des statistiques).
// valeur : { mois } pour un mois { annee, mois }, ou { plage } pour { debut, fin }.
export const PeriodeEmploye = ({ valeur, onChange }) => {
  const moisActuel = moisDe(aujourdhuiIso());
  const [calendrierOuvert, setCalendrierOuvert] = useState(false);

  const mois = valeur.mois ?? moisDe(valeur.plage.fin);
  const peutAvancer = rangMois(mois) < rangMois(moisActuel);

  const changerMois = (nombre) => {
    // Au mois en cours, « suivant » est inactif (aria-disabled : il garde le focus)
    if (nombre > 0 && !peutAvancer && !valeur.plage) return;
    onChange({ mois: decalerMois(mois, nombre) });
  };

  const appliquerPlage = (plage) => {
    onChange({ plage });
    setCalendrierOuvert(false);
  };

  const plageActive = Boolean(valeur.plage);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center rounded-lg border border-border bg-card">
        <Bouton
          variante="fantome"
          taille="nu"
          className="size-10 rounded-r-none"
          onClick={() => changerMois(-1)}
          aria-label="Mois précédent"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Bouton>
        <p
          aria-live="polite"
          className="min-w-44 px-2 text-center text-sm font-semibold first-letter:uppercase tabular-nums"
        >
          {plageActive ? libellePeriode(valeur.plage) : libelleMois(mois)}
        </p>
        <Bouton
          variante="fantome"
          taille="nu"
          onClick={() => changerMois(1)}
          aria-disabled={!peutAvancer && !plageActive}
          className="size-10 rounded-l-none aria-disabled:cursor-not-allowed aria-disabled:opacity-40"
          aria-label="Mois suivant"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Bouton>
      </div>

      <FenetreCalendrier
        ouvert={calendrierOuvert}
        onOuvertChange={setCalendrierOuvert}
        libelle="Choisir une période"
        declencheur={
          <Bouton variante={plageActive ? 'sombre' : 'secondaire'} taille="sm" aria-pressed={plageActive}>
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            Autre période
          </Bouton>
        }
      >
        <Calendrier
          valeur={valeur.plage ?? null}
          onAppliquer={appliquerPlage}
          onAnnuler={() => setCalendrierOuvert(false)}
        />
      </FenetreCalendrier>
    </div>
  );
};
