import { useState } from 'react';
import { Bouton } from '@/components/ui/bouton';
import { ListeDeroulante } from '@/components/ui/liste';
import { useFichePaie } from '@/hooks/useFichePaie';
import { MOIS } from '@/lib/personnel';

// Calcul du salaire mensuel d'un employé. Le résultat disparaît dès que le mois ou l'année change.
export const FichePaie = ({ employe, afficher }) => {
  const { fiche, calculer, reinitialiser } = useFichePaie(employe.id, afficher);
  const [mois, setMois] = useState(String(new Date().getMonth() + 1));
  const [annee, setAnnee] = useState(String(new Date().getFullYear()));

  const changerMois = (valeur) => {
    setMois(valeur);
    reinitialiser();
  };

  const changerAnnee = (valeur) => {
    setAnnee(valeur);
    reinitialiser();
  };

  const soumettre = (e) => {
    e.preventDefault();
    calculer(Number(annee), Number(mois));
  };

  return (
    <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-800">Calcul du Salaire Mensuel</h3>

      <form onSubmit={soumettre} className="flex items-end gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-gray-500">Mois</label>
          <ListeDeroulante
            valeur={mois}
            onChange={changerMois}
            options={MOIS}
            className="w-full rounded border px-2 py-1.5 capitalize"
            classeItem="text-sm capitalize"
          />
        </div>

        <div className="flex-1">
          <label className="mb-1 block text-xs text-gray-500">Année</label>
          <input
            type="number"
            value={annee}
            onChange={(e) => changerAnnee(e.target.value)}
            className="w-full rounded border px-2 py-1.5 text-sm"
            required
          />
        </div>

        <Bouton type="submit" taille="sm" className="py-1.5">
          Calculer
        </Bouton>
      </form>

      <div className="space-y-3 rounded border bg-gray-50 p-4 text-sm">
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-gray-600">Total Heures (Mois) :</span>
          <span className="text-base font-bold text-gray-800">{fiche ? `${fiche.totalHeures} h` : '—'}</span>
        </div>

        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-gray-600">Taux Horaire :</span>
          <span className="font-semibold text-gray-800">
            {fiche ? `${fiche.salaireHeure.toFixed(2)} € / h` : '—'}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 text-base font-bold text-red-600">
          <span>Salaire Total Estimé :</span>
          <span className="text-xl">{fiche ? `${fiche.salaireTotalEstime.toFixed(2)} €` : '—'}</span>
        </div>
      </div>
    </div>
  );
};