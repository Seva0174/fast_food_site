import { AlertTriangle } from 'lucide-react';
import { estimationSalaire, formaterHeures, formaterTaux } from '@/lib/personnel';
import { formaterPrix } from '@/lib/prix';

// Salaire estimé de l'employé sur la période affichée : heures de la période × taux horaire.
export const ResumePaie = ({ employe, heures, chargement }) => {
  const estimation = estimationSalaire(heures, employe.salaireHeure);

  return (
    <section aria-labelledby="titre-resume-paie" className="space-y-4 rounded-xl border border-border bg-card p-5">
      <h3 id="titre-resume-paie" className="titre-marque text-2xl">
        Salaire estimé
      </h3>

      <p aria-live="polite" className="text-4xl font-bold tabular-nums">
        {chargement ? '…' : estimation === null ? '—' : formaterPrix(estimation)}
      </p>

      {estimation === null ? (
        <p className="flex gap-2 rounded-lg border border-border p-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
          <span>
            Taux horaire non défini : le salaire ne peut pas être estimé. Renseigne-le avec le crayon de
            la ligne de {employe.nom}.
          </span>
        </p>
      ) : (
        <dl className="divide-y divide-border rounded-lg border border-border text-sm">
          <div className="flex items-baseline justify-between gap-3 px-3 py-2.5">
            <dt className="text-muted-foreground">Heures de la période</dt>
            <dd className="font-semibold tabular-nums">{formaterHeures(heures)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 px-3 py-2.5">
            <dt className="text-muted-foreground">Taux horaire</dt>
            <dd className="font-semibold tabular-nums">{formaterTaux(employe.salaireHeure)}</dd>
          </div>
        </dl>
      )}
    </section>
  );
};
