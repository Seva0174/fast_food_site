import { useRef, useState } from 'react';
import { Popover } from 'radix-ui';
import { CalendarDays } from 'lucide-react';
import { CalendrierPeriode } from './CalendrierPeriode';
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
  const contenuCalendrier = useRef(null);

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

        <Popover.Root open={calendrierOuvert} onOpenChange={setCalendrierOuvert}>
          <Popover.Trigger asChild>
            <button type="button" aria-pressed={persoActive} className={classeChoix(persoActive)}>
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {persoActive && periodePerso ? libellePeriode(periodePerso) : 'Personnalisée'}
            </button>
          </Popover.Trigger>
          {/* Sans portail : le calendrier hérite du thème de la page (clair dans l'admin) */}
          <Popover.Content
            ref={contenuCalendrier}
            align="start"
            sideOffset={8}
            collisionPadding={16}
            aria-label="Choisir une période"
            // Le focus va directement sur le jour actif du calendrier
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              contenuCalendrier.current?.querySelector('[data-date][tabindex="0"]')?.focus();
            }}
            className="z-50 rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-md animate-in fade-in zoom-in-95 duration-150"
          >
            <CalendrierPeriode
              valeur={periodePerso}
              onAppliquer={appliquer}
              onAnnuler={() => setCalendrierOuvert(false)}
            />
          </Popover.Content>
        </Popover.Root>
      </div>

      {resume && <p className="text-sm text-muted-foreground tabular-nums">{resume}</p>}
    </div>
  );
};
