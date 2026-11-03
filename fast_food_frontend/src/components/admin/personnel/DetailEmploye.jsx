import { useState } from 'react';
import { X } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { useHeuresEmploye } from '@/hooks/useHeuresEmploye';
import { totalHeures } from '@/lib/personnel';
import { aujourdhuiIso, decalerMois, moisDe, periodeDeSelection } from '@/lib/periode';
import { PanneauHeures } from './PanneauHeures';
import { PeriodeEmploye } from './PeriodeEmploye';
import { ResumePaie } from './ResumePaie';

// Heures et salaire d'un employé, sur une seule période partagée (le mois dernier par défaut,
// celui qu'on règle en général). refTitre : le titre reçoit le focus à l'ouverture.
export const DetailEmploye = ({ employe, afficher, onFermer, refTitre }) => {
  const [selection, setSelection] = useState(() => ({ mois: decalerMois(moisDe(aujourdhuiIso()), -1) }));
  const periode = periodeDeSelection(selection);
  const { heures, chargement, ajouter, supprimer } = useHeuresEmploye(employe.id, periode, afficher);

  return (
    <section aria-labelledby="titre-detail-employe" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <h2
          id="titre-detail-employe"
          ref={refTitre}
          tabIndex={-1}
          className="titre-marque min-w-0 scroll-mt-24 break-words text-3xl outline-none"
        >
          {employe.nom}
        </h2>
        <Bouton variante="fantome" taille="sm" onClick={onFermer}>
          <X className="h-4 w-4" aria-hidden="true" />
          Fermer
        </Bouton>
      </div>

      <PeriodeEmploye valeur={selection} onChange={setSelection} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <PanneauHeures
          heures={heures}
          chargement={chargement}
          periode={periode}
          afficher={afficher}
          ajouter={ajouter}
          supprimer={supprimer}
        />
        <ResumePaie employe={employe} heures={totalHeures(heures)} chargement={chargement} />
      </div>
    </section>
  );
};
