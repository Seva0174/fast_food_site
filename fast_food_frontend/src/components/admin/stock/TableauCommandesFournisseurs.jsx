import { Eye } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { ListeDeroulante } from '@/components/ui/liste';
import { formaterPrix } from '@/lib/prix';
import { formaterDateCommande, infosStatut, optionsStatut } from '@/lib/approvisionnement';

// Historique des commandes fournisseurs : détails et changement de statut.
export const TableauCommandesFournisseurs = ({ commandes, onVoirDetails, onChangerStatut }) => (
  <section className="space-y-4 border-t border-border pt-6">
    <h3 className="text-lg font-semibold text-foreground">Historique des commandes d'approvisionnement</h3>

    {commandes.length === 0 ? (
      <p className="text-sm text-muted-foreground">Aucune commande enregistrée.</p>
    ) : (
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Commandes passées aux fournisseurs</caption>
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th scope="col" className="p-3 font-medium">Fournisseur</th>
              <th scope="col" className="p-3 font-medium">Date</th>
              <th scope="col" className="p-3 text-right font-medium">Montant</th>
              <th scope="col" className="p-3 font-medium">Statut</th>
              <th scope="col" className="p-3 font-medium"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {commandes.map((cmd) => (
              <tr key={cmd.id} className="hover:bg-muted/40">
                <td className="p-3 font-medium">{cmd.fournisseurNom}</td>
                <td className="whitespace-nowrap p-3 text-muted-foreground">{formaterDateCommande(cmd.dateCommande)}</td>
                <td className="whitespace-nowrap p-3 text-right font-semibold tabular-nums">{formaterPrix(cmd.montantTotal)}</td>
                <td className="p-3">
                  <span className={infosStatut(cmd.status).classe}>{infosStatut(cmd.status).libelle}</span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Bouton
                      variante="neutre"
                      taille="iconeCarree"
                      onClick={() => onVoirDetails(cmd.id)}
                      title="Voir les détails"
                      aria-label={`Détails de la commande ${cmd.fournisseurNom} du ${formaterDateCommande(cmd.dateCommande)}`}
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    </Bouton>

                    <ListeDeroulante
                      valeur={cmd.status}
                      onChange={(statut) => onChangerStatut(cmd.id, statut)}
                      options={optionsStatut(cmd.status)}
                      ariaLabel={`Statut de la commande ${cmd.fournisseurNom}`}
                      className="min-w-[11rem] cursor-pointer rounded-lg border border-input px-2 py-1 text-sm font-medium"
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