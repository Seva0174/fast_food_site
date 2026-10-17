import { Eye } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { ListeDeroulante } from '@/components/ui/liste';
import { STATUTS_COMMANDE, optionsStatut } from '@/lib/approvisionnement';

// Historique des commandes fournisseurs : détails et changement de statut.
export const TableauCommandesFournisseurs = ({ commandes, onVoirDetails, onChangerStatut }) => (
  <section className="space-y-4 border-t pt-4">
    <h3 className="text-sm font-bold text-gray-800">Historique des commandes d'approvisionnement</h3>

    {commandes.length === 0 ? (
      <p className="text-xs text-gray-500">Aucune commande enregistrée.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b bg-gray-100 text-gray-600">
              <th className="p-2.5">Fournisseur</th>
              <th className="p-2.5">Date</th>
              <th className="p-2.5">Montant</th>
              <th className="p-2.5">Statut</th>
              <th className="p-2.5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {commandes.map((cmd) => (
              <tr key={cmd.id} className="hover:bg-gray-50">
                <td className="p-2.5">{cmd.fournisseurNom}</td>
                <td className="p-2.5">{cmd.dateCommande}</td>
                <td className="p-2.5 font-semibold text-red-600">{cmd.montantTotal.toFixed(2)} €</td>
                <td className="p-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUTS_COMMANDE[cmd.status].classe}`}
                  >
                    {cmd.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-2.5">
                  <div className="flex items-center gap-2">
                    <Bouton
                      variante="neutre"
                      taille="iconeCarree"
                      onClick={() => onVoirDetails(cmd.id)}
                      title="Voir les détails"
                      aria-label="Voir les détails"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Bouton>

                    <ListeDeroulante
                      valeur={cmd.status}
                      onChange={(statut) => onChangerStatut(cmd.id, statut)}
                      options={optionsStatut(cmd.status)}
                      className="min-w-[11rem] cursor-pointer rounded border bg-white p-1 text-xs font-medium"
                      classeItem="text-xs"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);