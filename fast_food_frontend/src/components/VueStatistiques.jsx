import { BarrePeriode } from '@/components/admin/statistiques/BarrePeriode';
import { GraphiqueCommandesJour } from '@/components/admin/statistiques/GraphiqueCommandesJour';
import { StatsGlobalesCards } from '@/components/admin/statistiques/StatsGlobalesCards';
import { TopVentesTable } from '@/components/admin/statistiques/TopVentesTable';
import { useStatistiques } from '@/hooks/useStatistiques';

export function VueStatistiques() {
  const { stats, topProduits, commandesParJour, chargement, erreur, charger } = useStatistiques();

  return (
    <div className="space-y-6">
      <BarrePeriode onChanger={charger} />

      {chargement && <p className="text-gray-500">Chargement des statistiques...</p>}
      {erreur && <p className="font-medium text-red-500">{erreur}</p>}

      {!chargement && !erreur && (
        <>
          <StatsGlobalesCards stats={stats} />
          <GraphiqueCommandesJour data={commandesParJour} />
          <TopVentesTable topProduits={topProduits} />
        </>
      )}
    </div>
  );
}