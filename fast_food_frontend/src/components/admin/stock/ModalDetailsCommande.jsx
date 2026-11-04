import { Bouton } from '@/components/ui/bouton';
import { ModalShell } from '@/components/modales/ModalShell';
import { formaterDateCommande, infosStatut } from '@/lib/approvisionnement';
import { formaterPrix, formaterPrixUnitaire } from '@/lib/prix';
import { formaterQuantite } from '@/lib/stock';

// Détail des lignes d'une commande fournisseur (déjà présentes dans la commande). Les unités viennent
// des stocks (stocks) : la commande ne les porte pas.
export const ModalDetailsCommande = ({ commande, stocks, onClose }) => {
  const unites = new Map(stocks.map((stock) => [stock.id, stock.uniteMesure]));

  return (
    <ModalShell
      titre={`Commande #${commande.id}`}
      sousTitre={`${commande.fournisseurNom} · ${formaterDateCommande(commande.dateCommande)} · ${
        infosStatut(commande.status).libelle
      }`}
      onClose={onClose}
      prixLibelle="Total HT"
      prixTotal={commande.montantTotal}
      actions={
        <Bouton variante="secondaire" taille="sm" onClick={onClose}>
          Fermer
        </Bouton>
      }
    >
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Articles de la commande</caption>
          <thead className="border-b border-border bg-muted text-muted-foreground">
            <tr>
              <th scope="col" className="p-2.5 font-medium">Article</th>
              <th scope="col" className="p-2.5 text-right font-medium">Quantité</th>
              <th scope="col" className="whitespace-nowrap p-2.5 text-right font-medium">Prix unitaire</th>
              <th scope="col" className="p-2.5 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {commande.details.map((ligne) => (
              <tr key={ligne.id}>
                <th scope="row" className="p-2.5 text-left font-medium text-foreground">{ligne.matierePremiereNom}</th>
                <td className="whitespace-nowrap p-2.5 text-right tabular-nums">
                  {formaterQuantite(ligne.quantite, unites.get(ligne.idStock))}
                </td>
                <td className="whitespace-nowrap p-2.5 text-right tabular-nums text-muted-foreground">
                  {formaterPrixUnitaire(ligne.prixUnitaire)}
                </td>
                <td className="whitespace-nowrap p-2.5 text-right font-semibold tabular-nums text-foreground">
                  {formaterPrix(ligne.totalLigne)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ModalShell>
  );
};
