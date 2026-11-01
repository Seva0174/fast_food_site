import { formaterPrix } from '@/lib/prix';
import { CHIFFRES_SECONDAIRES, resultatNet, variationPourcent } from '@/lib/statistiques';
import { CarteStatistique } from './CarteStatistique';

// Le chiffre d'affaires et le résultat répondent d'abord à « est-ce que ça rapporte ? » ;
// les autres chiffres les expliquent, en second plan.
// statsPrecedentes : chiffres de la période précédente (null en vue globale).
export function StatsGlobalesCards({ stats, statsPrecedentes }) {
  if (!stats) return null;

  const resultat = resultatNet(stats);
  const comparer = (actuel, precedent) => (statsPrecedentes ? variationPourcent(actuel, precedent) : null);

  return (
    <section aria-label="Chiffres clés" className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CarteStatistique
          libelle="Chiffre d'affaires"
          valeur={formaterPrix(stats.chiffreAffairesTotal)}
          variation={comparer(stats.chiffreAffairesTotal, statsPrecedentes?.chiffreAffairesTotal)}
        />
        <CarteStatistique
          libelle="Résultat"
          valeur={formaterPrix(resultat)}
          deficit={resultat < 0}
          variation={comparer(resultat, statsPrecedentes && resultatNet(statsPrecedentes))}
          detail={`${formaterPrix(stats.chiffreAffairesTotal)} de ventes − ${formaterPrix(
            stats.depensesApprovisionnement
          )} d'approvisionnement − ${formaterPrix(stats.masseSalariale)} de salaires`}
        />
      </div>

      <dl className="grid grid-cols-1 divide-y divide-border rounded-xl border border-border bg-card md:grid-cols-4 md:divide-x md:divide-y-0">
        {CHIFFRES_SECONDAIRES.map(({ cle, libelle, montant }) => (
          <div key={cle} className="min-w-0 p-4">
            <dt className="text-sm text-muted-foreground">{libelle}</dt>
            <dd className="mt-1 truncate text-xl font-semibold tabular-nums">
              {montant
                ? formaterPrix(stats[cle])
                : Number(stats[cle] ?? 0).toLocaleString('fr-FR')}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
