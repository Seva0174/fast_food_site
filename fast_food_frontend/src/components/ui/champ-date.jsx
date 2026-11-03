import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Calendrier } from '@/components/ui/calendrier';
import { FenetreCalendrier } from '@/components/ui/fenetre-calendrier';
import { libelleJourCourt } from '@/lib/periode';

// Champ de choix d'un jour, avec le même calendrier que le choix de période des statistiques.
// À relier à un <label htmlFor={id}>. valeur : "AAAA-MM-JJ" ; min / max : jours sélectionnables.
export const ChampDate = ({ id, valeur, onChange, min, max, className = '', ...props }) => {
  const [ouvert, setOuvert] = useState(false);

  return (
    <FenetreCalendrier
      ouvert={ouvert}
      onOuvertChange={setOuvert}
      libelle="Choisir un jour"
      declencheur={
        <button
          id={id}
          type="button"
          aria-haspopup="dialog"
          className={`flex w-full min-h-10 items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-3 text-left text-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive ${className}`}
          {...props}
        >
          <span className="first-letter:uppercase">{valeur ? libelleJourCourt(valeur) : 'Choisir un jour'}</span>
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      }
    >
      <Calendrier
        mode="jour"
        valeur={valeur}
        min={min}
        max={max}
        onAppliquer={(jour) => {
          onChange(jour);
          setOuvert(false);
        }}
      />
    </FenetreCalendrier>
  );
};
