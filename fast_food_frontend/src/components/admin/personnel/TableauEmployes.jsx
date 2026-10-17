import { estSonCompte } from '@/lib/personnel';
import { LigneEmploye } from './LigneEmploye';

export const TableauEmployes = ({
  employes,
  chargement,
  erreur,
  idSelectionne,
  emailConnecte,
  onModifier,
  onGererHeures,
  onSupprimer,
}) => (
  <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
    <h2 className="text-xl font-bold text-gray-800">Liste des Salariés</h2>
    {chargement && <p className="text-sm text-gray-500">Chargement de l'équipe...</p>}
    {erreur && <p className="text-sm text-red-500">{erreur}</p>}

    {!chargement && !erreur && (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-xs uppercase text-gray-600">
              <th className="p-3">Nom</th>
              <th className="p-3">Email</th>
              <th className="p-3">Rôle Système</th>
              <th className="p-3">Poste RH</th>
              <th className="p-3">Taux Horaire</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {employes.map((employe) => (
              <LigneEmploye
                key={employe.id}
                employe={employe}
                selectionne={idSelectionne === employe.id}
                estMonCompte={estSonCompte(employe, emailConnecte)}
                onModifier={onModifier}
                onGererHeures={onGererHeures}
                onSupprimer={onSupprimer}
              />
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);