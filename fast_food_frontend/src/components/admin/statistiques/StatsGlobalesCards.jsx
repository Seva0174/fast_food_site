import { CARTES_STATISTIQUES } from '@/lib/statistiques';
import { CarteStatistique } from './CarteStatistique';

export function StatsGlobalesCards({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
      {CARTES_STATISTIQUES.map((carte) => (
        <CarteStatistique
          key={carte.cle}
          libelle={carte.libelle}
          valeur={`${stats[carte.cle]}${carte.suffixe}`}
          classes={carte.classes}
        />
      ))}
    </div>
  );
}