import { useState } from 'react';
import { Eye, RotateCw } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { BandeauMessage } from '@/components/ui/bandeau';
import { formaterPrix } from '@/lib/prix';
import {
  actionsStatut,
  commandesDuFournisseur,
  formaterDateCommande,
  infosStatut,
} from '@/lib/approvisionnement';

// Historique des commandes fournisseurs : détails et passage au statut suivant. Chaque commande ne
// propose que les étapes possibles (« Marquer expédiée », « Réceptionner », « Annuler la commande ») ;
// les statuts finaux n'ont plus d'action. fournisseur ({ id, nom }) : le fournisseur sélectionné plus
// haut, pour filtrer l'historique sur lui.
export const TableauCommandesFournisseurs = ({
  commandes,
  fournisseur,
  chargement,
  erreur,
  enCours,
  onRecharger,
  onVoirDetails,
  onChangerStatut,
}) => {
  const [seulementFournisseur, setSeulementFournisseur] = useState(false);
  const filtre = seulementFournisseur && fournisseur;
  const affichees = filtre ? commandesDuFournisseur(commandes, fournisseur.id) : commandes;
  const pret = !chargement && !erreur;

  const rendreContenu = () => {
    if (chargement) {
      return (
        <p role="status" className="text-sm text-muted-foreground">
          Chargement de l'historique…
        </p>
      );
    }
    if (erreur) {
      return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <BandeauMessage message={{ texte: erreur, type: 'erreur' }} className="flex-1" />
          <Bouton variante="secondaire" onClick={onRecharger}>
            Réessayer
          </Bouton>
        </div>
      );
    }
    if (commandes.length === 0) {
      return (
        <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Aucune commande fournisseur pour le moment. Les commandes validées depuis le bon de commande
          apparaîtront ici, prêtes à être suivies jusqu'à leur réception.
        </p>
      );
    }
    if (affichees.length === 0) {
      return (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <span>Aucune commande passée à {fournisseur.nom}.</span>
          <Bouton variante="secondaire" taille="sm" onClick={() => setSeulementFournisseur(false)}>
            Voir toutes les commandes
          </Bouton>
        </div>
      );
    }
    return (
      // relative : les éléments sr-only (positionnés en absolu) restent dans la zone qui défile
      <div className="relative overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[54rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            {filtre ? `Commandes passées à ${fournisseur.nom}` : 'Commandes passées aux fournisseurs'}
          </caption>
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th scope="col" className="p-3 font-medium">N°</th>
              <th scope="col" className="p-3 font-medium">Fournisseur</th>
              <th scope="col" className="p-3 font-medium">Date</th>
              <th scope="col" className="p-3 text-right font-medium">Montant</th>
              <th scope="col" className="p-3 font-medium">Statut</th>
              <th scope="col" className="p-3 text-right font-medium"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {affichees.map((cmd) => {
              const statut = infosStatut(cmd.status);
              const description = `n° ${cmd.id}, ${cmd.fournisseurNom} du ${formaterDateCommande(cmd.dateCommande)}`;
              return (
                <tr key={cmd.id} className="transition-colors hover:bg-muted/40">
                  <td className="whitespace-nowrap p-3 tabular-nums text-muted-foreground">#{cmd.id}</td>
                  <th scope="row" className="p-3 text-left font-medium">{cmd.fournisseurNom}</th>
                  <td className="whitespace-nowrap p-3 text-muted-foreground">{formaterDateCommande(cmd.dateCommande)}</td>
                  <td className="whitespace-nowrap p-3 text-right font-semibold tabular-nums">{formaterPrix(cmd.montantTotal)}</td>
                  <td className="p-3">
                    <span className={statut.classe}>{statut.libelle}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      {actionsStatut(cmd.status).map((action) => (
                        <Bouton
                          key={action.statut}
                          variante={action.retrait ? 'fantomeDanger' : 'secondaire'}
                          taille="sm"
                          className="whitespace-nowrap"
                          disabled={enCours}
                          onClick={() => onChangerStatut(cmd, action.statut)}
                          aria-label={`${action.libelle} (commande ${description})`}
                        >
                          {action.libelle}
                        </Bouton>
                      ))}
                      <Bouton
                        variante="secondaire"
                        taille="nu"
                        className="size-9 shrink-0"
                        data-details-commande={cmd.id}
                        onClick={() => onVoirDetails(cmd.id)}
                        title="Voir le détail"
                        aria-label={`Détail de la commande ${description}`}
                      >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      </Bouton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <section aria-labelledby="titre-historique-fournisseurs" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="titre-historique-fournisseurs" className="titre-marque text-2xl">
          Historique des commandes
        </h3>
        {pret && commandes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {fournisseur && (
              <Bouton
                variante={seulementFournisseur ? 'sombre' : 'secondaire'}
                taille="sm"
                aria-pressed={seulementFournisseur}
                onClick={() => setSeulementFournisseur((actif) => !actif)}
              >
                Seulement {fournisseur.nom}
              </Bouton>
            )}
            <Bouton variante="secondaire" taille="sm" onClick={onRecharger}>
              <RotateCw className="h-4 w-4" aria-hidden="true" />
              Actualiser
            </Bouton>
          </div>
        )}
      </div>

      {rendreContenu()}
    </section>
  );
};
