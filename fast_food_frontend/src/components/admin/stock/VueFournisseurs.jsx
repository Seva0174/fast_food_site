import { useState } from 'react';
import { Truck } from 'lucide-react';
import { BandeauMessage } from '@/components/ui/bandeau';
import { ModalConfirmation } from '@/components/modales/ModalConfirmation';
import { BarreFournisseurs } from '@/components/admin/stock/BarreFournisseurs';
import { BonCommande } from '@/components/admin/stock/BonCommande';
import { GrilleCatalogue } from '@/components/admin/stock/GrilleCatalogue';
import { ImportCatalogue } from '@/components/admin/stock/ImportCatalogue';
import { ModalDetailsCommande } from '@/components/admin/stock/ModalDetailsCommande';
import { TableauCommandesFournisseurs } from '@/components/admin/stock/TableauCommandesFournisseurs';
import { useBonCommande } from '@/hooks/useBonCommande';
import { useCommandesFournisseurs } from '@/hooks/useCommandesFournisseurs';
import { useConfirmation } from '@/hooks/useConfirmation';
import { useFournisseurs } from '@/hooks/useFournisseurs';
import { useMessage } from '@/hooks/useMessage';
import { construirePayload } from '@/lib/approvisionnement';

// Sous-onglet "Fournisseurs & Commandes" : catalogue, bon de commande et historique.
export function VueFournisseurs() {
  const { message, afficher } = useMessage();
  const {
    fournisseurs,
    idSelectionne,
    catalogue,
    chargement: chargementFournisseurs,
    selectionner,
    creer: creerFournisseur,
    supprimer: supprimerFournisseur,
    importerCatalogue,
  } = useFournisseurs(afficher);
  const {
    commandes,
    chargement: chargementCommandes,
    charger: rechargerCommandes,
    creer: creerCommande,
    changerStatut,
  } = useCommandesFournisseurs(afficher);
  const bonCommande = useBonCommande();
  const { confirmer, modaleProps } = useConfirmation();
  const [idCommandeDetail, setIdCommandeDetail] = useState(null);

  const chargement = chargementFournisseurs || chargementCommandes;
  // La commande affichée est relue dans la liste, pour rester à jour après un rechargement
  const commandeDetail = commandes.find((c) => c.id === idCommandeDetail);

  // Le bon de commande est propre à un fournisseur : il est vidé quand on en change
  const changerFournisseur = (id) => {
    selectionner(id);
    bonCommande.vider();
  };

  const ajouterFournisseur = async (nom) => {
    const cree = await creerFournisseur(nom);
    if (cree) bonCommande.vider();
    return cree;
  };

  const demanderSuppression = async (id) => {
    const confirme = await confirmer({
      titre: 'Supprimer le fournisseur',
      message: 'Voulez-vous supprimer ce fournisseur, son catalogue et son historique de commandes ?',
      libelleConfirmer: 'Supprimer',
    });
    if (!confirme) return;

    if (await supprimerFournisseur(id)) {
      bonCommande.vider();
      // Ses commandes ont été supprimées avec lui
      await rechargerCommandes();
    }
  };

  const validerBon = async () => {
    if (!idSelectionne || bonCommande.bon.length === 0) return;
    if (await creerCommande(construirePayload(idSelectionne, bonCommande.bon))) {
      bonCommande.vider();
    }
  };

  return (
    <div className="space-y-8">
      <BandeauMessage message={message} />

      <BarreFournisseurs
        fournisseurs={fournisseurs}
        idSelectionne={idSelectionne}
        chargement={chargement}
        onSelectionner={changerFournisseur}
        onCreer={ajouterFournisseur}
        onSupprimer={demanderSuppression}
      />

      {idSelectionne && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-bold text-gray-800">
                <Truck className="h-5 w-5 text-red-600" />
                Catalogue des articles du fournisseur
              </h3>
              <ImportCatalogue chargement={chargement} onImporter={importerCatalogue} />
            </div>

            <GrilleCatalogue catalogue={catalogue} onAjouter={bonCommande.ajouter} />
          </div>

          <BonCommande
            bon={bonCommande.bon}
            total={bonCommande.total}
            chargement={chargement}
            onIncrementer={bonCommande.incrementer}
            onDecrementer={bonCommande.decrementer}
            onModifierQuantite={bonCommande.modifierQuantite}
            onValider={validerBon}
          />
        </div>
      )}

      <TableauCommandesFournisseurs
        commandes={commandes}
        onVoirDetails={setIdCommandeDetail}
        onChangerStatut={changerStatut}
      />

      {commandeDetail && (
        <ModalDetailsCommande commande={commandeDetail} onClose={() => setIdCommandeDetail(null)} />
      )}

      <ModalConfirmation {...modaleProps} />
    </div>
  );
}