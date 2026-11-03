import { Bouton } from '@/components/ui/bouton';
import { ModalShell } from '@/components/modales/ModalShell';

// Détail des lignes d'une commande fournisseur (déjà présentes dans la commande).
export const ModalDetailsCommande = ({ commande, onClose }) => (
  <ModalShell
    titre={`Commande #${commande.id}`}
    sousTitre={`${commande.fournisseurNom} • ${commande.dateCommande}`}
    onClose={onClose}
    prixLibelle="Total commande"
    prixTotal={commande.montantTotal}
    actions={
      <Bouton variante="secondaire" taille="sm" onClick={onClose}>
        Fermer
      </Bouton>
    }
  >
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-left text-xs">
        <thead className="border-b bg-muted font-semibold text-muted-foreground">
          <tr>
            <th className="p-2.5">Article</th>
            <th className="p-2.5 text-center">Qté</th>
            <th className="p-2.5 text-right">P.U</th>
            <th className="p-2.5 text-right">Sous-total</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {commande.details.map((ligne) => (
            <tr key={ligne.id} className="hover:bg-muted/40">
              <td className="p-2.5 font-medium text-foreground">{ligne.matierePremiereNom}</td>
              <td className="p-2.5 text-center">{ligne.quantite}</td>
              <td className="p-2.5 text-right text-muted-foreground">{ligne.prixUnitaire.toFixed(2)} €</td>
              <td className="p-2.5 text-right font-semibold text-foreground">{ligne.totalLigne.toFixed(2)} €</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </ModalShell>
);