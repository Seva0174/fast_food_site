import { EnTeteVueAdmin } from '@/components/admin/EnTeteVueAdmin';
import { BarrePeriode } from '@/components/admin/statistiques/BarrePeriode';
import { GraphiqueCommandesJour } from '@/components/admin/statistiques/GraphiqueCommandesJour';
import { StatsGlobalesCards } from '@/components/admin/statistiques/StatsGlobalesCards';
import { TopVentesTable } from '@/components/admin/statistiques/TopVentesTable';
import { BandeauMessage } from '@/components/ui/bandeau';
import { Bouton } from '@/components/ui/bouton';
import { useStatistiques } from '@/hooks/useStatistiques';
import { libelleNombreJours, libellePeriode } from '@/lib/periode';

// Rappel de ce qui est affiché : la période et celle qui sert de comparaison.
const resumePeriode = (donnees) => {
  if (!donnees) return null;
  if (!donnees.periode) return 'Toutes les données enregistrées, sans comparaison.';

  const affichee = `Période : ${libellePeriode(donnees.periode)} (${libelleNombreJours(donnees.periode)}).`;
  return donnees.precedente
    ? `${affichee} Comparaison avec le ${libellePeriode(donnees.precedente)}.`
    : `${affichee} Pas de données sur la période précédente pour comparer.`;
};

export function VueStatistiques() {
  const { donnees, chargement, erreur, charger, recharger } = useStatistiques();

  return (
    <div className="space-y-6">
      <EnTeteVueAdmin
        titre="Statistiques"
        description="Chiffre d'affaires, résultat, commandes par jour et produits les plus vendus."
      />

      <BarrePeriode onChanger={charger} resume={resumePeriode(donnees)} />

      {erreur && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <BandeauMessage message={{ texte: erreur, type: 'erreur' }} className="flex-1" />
          <Bouton variante="secondaire" onClick={recharger} disabled={chargement}>
            Réessayer
          </Bouton>
        </div>
      )}

      {!donnees && chargement && (
        <p role="status" className="text-muted-foreground">
          Chargement des statistiques…
        </p>
      )}

      {/* Pendant un nouveau chargement, les chiffres précédents restent visibles, atténués */}
      {donnees && (
        <div
          aria-busy={chargement}
          className={`space-y-6 transition-opacity duration-200 ${chargement ? 'opacity-50' : ''}`}
        >
          <StatsGlobalesCards stats={donnees.stats} statsPrecedentes={donnees.statsPrecedentes} />
          <GraphiqueCommandesJour data={donnees.commandesParJour} surPeriode={Boolean(donnees.periode)} />
          <TopVentesTable topProduits={donnees.topProduits} surPeriode={Boolean(donnees.periode)} />
        </div>
      )}
    </div>
  );
}
