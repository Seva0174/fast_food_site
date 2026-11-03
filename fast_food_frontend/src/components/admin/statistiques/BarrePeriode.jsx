import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Calendrier } from '@/components/ui/calendrier';
import { FenetreCalendrier } from '@/components/ui/fenetre-calendrier';
import {
  PERIODE_GLOBALE,
  PERIODE_PERSONNALISEE,
  PERIODES_RAPIDES,
  libellePeriode,
  periodeRapide,
} from '@/lib/periode';

// Choix neutre (pas d'orange) : l'accent reste aux données et à l'action « Appliquer ».
const classeChoix = (actif) =>
  `inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-lg px-3.5 text-sm font-semibold transition-colors ${
    actif
      ? 'bg-foreground text-background'
      : 'border border-border bg-secondary text-secondary-foreground hover:bg-accent'
  }`;

// Périodes rapides et période personnalisée (calendrier).
// onChanger reçoit null (vue globale) ou { debut, fin }.
// resume : rappel de la période affichée et de celle qui sert de comparaison.
export const BarrePeriode = ({ onChanger, resume }) => {
  const [choix, setChoix] = useState(PERIODE_GLOBALE);
  const [periodePerso, setPeriodePerso] = useState(null);
  const [calendrierOuvert, setCalendrierOuvert] = useState(false);

  const choisirRapide = (id) => {
    setChoix(id);
    onChanger(periodeRapide(id));
  };

  const appliquer = (periode) => {
    setPeriodePerso(periode);
    setChoix(PERIODE_PERSONNALISEE);
    setCalendrierOuvert(false);
    onChanger(periode);
  };

  const persoActive = choix === PERIODE_PERSONNALISEE;

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div role="group" aria-label="Période" className="flex flex-wrap gap-2">
        {PERIODES_RAPIDES.map(({ id, libelle }) => (
          <button
            key={id}
            type="button"
            aria-pressed={choix === id}
            onClick={() => choisirRapide(id)}
            className={classeChoix(choix === id)}
          >
            {libelle}
          </button>
        ))}

        <FenetreCalendrier
          ouvert={calendrierOuvert}
          onOuvertChange={setCalendrierOuvert}
          libelle="Choisir une période"
          declencheur={
            <button type="button" aria-pressed={persoActive} className={classeChoix(persoActive)}>
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {persoActive && periodePerso ? libellePeriode(periodePerso) : 'Personnalisée'}
            </button>
          }
        >
          <Calendrier
            valeur={periodePerso}
            onAppliquer={appliquer}
            onAnnuler={() => setCalendrierOuvert(false)}
          />
        </FenetreCalendrier>
      </div>

      {resume && <p className="text-sm text-muted-foreground tabular-nums">{resume}</p>}
    </div>
  );
};
