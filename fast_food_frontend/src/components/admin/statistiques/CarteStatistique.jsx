import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';

// Évolution par rapport à la période précédente : la flèche et le signe portent le sens,
// pas la couleur (une hausse des dépenses n'est pas une bonne nouvelle).
const Variation = ({ pourcent }) => {
  const Icone = pourcent > 0 ? ArrowUpRight : pourcent < 0 ? ArrowDownRight : ArrowRight;
  const signe = pourcent > 0 ? '+' : '';

  return (
    <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
      <Icone className="h-4 w-4 shrink-0 text-foreground" aria-hidden="true" />
      <span className="font-semibold tabular-nums text-foreground">
        {signe}
        {pourcent} %
      </span>
      par rapport à la période précédente
    </p>
  );
};

// Chiffre mis en avant.
// deficit : la valeur passe en couleur d'alerte avec la mention « Déficit ».
// variation : évolution en % (null : pas de comparaison possible).
export const CarteStatistique = ({ libelle, valeur, detail, deficit = false, variation = null }) => (
  <div className="rounded-xl border border-border bg-card p-5">
    <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      {libelle}
      {deficit && (
        <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-bold text-destructive">
          Déficit
        </span>
      )}
    </p>
    <p className={`mt-1 truncate text-4xl font-bold tabular-nums ${deficit ? 'text-destructive' : ''}`}>
      {valeur}
    </p>
    {variation !== null && <Variation pourcent={variation} />}
    {detail && <p className="mt-2 text-sm text-muted-foreground tabular-nums">{detail}</p>}
  </div>
);
