import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { BandeauMessage } from '@/components/ui/bandeau';
import { MessageFlottant } from '@/components/ui/message-flottant';
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
import { useRetourFocus } from '@/hooks/useRetourFocus';
import {
  STATUT_COMMANDE,
  commandesDuFournisseur,
  confirmationStatut,
  construirePayload,
  messageSuppressionFournisseur,
} from '@/lib/approvisionnement';

// Sous-onglet « Réapprovisionnement » : choix du fournisseur, catalogue, bon de commande et historique.
// stocks : niveaux actuels (catalogue, unités) ; onStockCredite : relit les stocks après une réception ;
// refTitre : titre de la page, qui reprend le focus après la suppression d'un fournisseur.
export function VueFournisseurs({ stocks, onStockCredite, refTitre }) {
  const { message, afficher } = useMessage();
  const fournisseurs = useFournisseurs(afficher);
  const {
    commandes,
    chargement: chargementCommandes,
    erreur: erreurCommandes,
    enCours: enCoursCommandes,
    charger: rechargerCommandes,
    creer: creerCommande,
    changerStatut,
  } = useCommandesFournisseurs(afficher);
  const { idSelectionne, catalogue } = fournisseurs;
  // Un bon par fournisseur : changer de fournisseur ne perd pas le bon préparé
  const bonCommande = useBonCommande(idSelectionne);
  const { confirmer, modaleProps } = useConfirmation();
  const [idCommandeDetail, setIdCommandeDetail] = useState(null);
  const [importOuvert, setImportOuvert] = useState(false);
  const boutonImport = useRetourFocus(importOuvert);
  const titreCatalogue = useRef(null);

  const enCours = fournisseurs.enCours || enCoursCommandes;
  const fournisseur = fournisseurs.fournisseurs.find((f) => String(f.id) === String(idSelectionne));
  // La commande affichée est relue dans la liste, pour rester à jour après un rechargement
  const commandeDetail = commandes.find((c) => c.id === idCommandeDetail);
  // Catalogue vide : l'import est la seule chose à faire, l'encart reste ouvert
  const catalogueVide = !fournisseurs.chargementCatalogue && !fournisseurs.erreurCatalogue && catalogue.length === 0;

  const changerFournisseur = (id) => {
    fournisseurs.selectionner(id);
    setImportOuvert(false);
  };

  // Catalogue vide rempli par l'import : l'encart disparaît, le focus va au titre du catalogue
  const importer = async (fichier) => {
    const etaitVide = catalogueVide;
    const reussi = await fournisseurs.importerCatalogue(fichier);
    if (reussi && etaitVide) titreCatalogue.current?.focus();
    return reussi;
  };

  const demanderSuppression = async (id) => {
    const confirme = await confirmer({
      titre: 'Supprimer le fournisseur ?',
      message: messageSuppressionFournisseur(
        fournisseur?.nom ?? '',
        catalogue.length,
        commandesDuFournisseur(commandes, id).length
      ),
      libelleConfirmer: 'Supprimer le fournisseur',
      libelleRefuser: 'Garder',
      destructif: true,
    });
    if (!confirme) return;

    if (await fournisseurs.supprimer(id)) {
      bonCommande.oublier(id);
      // Ses commandes ont été supprimées avec lui
      await rechargerCommandes();
      refTitre.current?.focus();
    }
  };

  const validerBon = async () => {
    if (!idSelectionne || bonCommande.bon.length === 0) return;
    if (await creerCommande(construirePayload(idSelectionne, bonCommande.bon))) {
      bonCommande.vider();
    }
  };

  // Réception et annulation sont définitives : elles demandent confirmation. Le focus revient ensuite
  // au bouton « détail » de la ligne (le bouton cliqué a disparu).
  const changerStatutCommande = async (commande, statut) => {
    const confirmation = confirmationStatut(commande, statut);
    if (confirmation && !(await confirmer(confirmation))) return;
    if (await changerStatut(commande.id, statut)) {
      if (statut === STATUT_COMMANDE.RECUE) onStockCredite();
      document.querySelector(`[data-details-commande="${commande.id}"]`)?.focus();
    }
  };

  const barre = (
    <BarreFournisseurs
      fournisseurs={fournisseurs.fournisseurs}
      idSelectionne={idSelectionne}
      bons={bonCommande.bons}
      enCours={enCours}
      onSelectionner={changerFournisseur}
      onCreer={fournisseurs.creer}
      onSupprimer={demanderSuppression}
    />
  );

  const rendreCommande = () => {
    if (fournisseurs.chargement) {
      return (
        <p role="status" className="text-sm text-muted-foreground">
          Chargement des fournisseurs…
        </p>
      );
    }
    if (fournisseurs.erreur) {
      return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <BandeauMessage message={{ texte: fournisseurs.erreur, type: 'erreur' }} className="flex-1" />
          <Bouton variante="secondaire" onClick={fournisseurs.charger}>
            Réessayer
          </Bouton>
        </div>
      );
    }
    if (!idSelectionne) return barre;

    // Le choix du fournisseur et le catalogue forment la colonne de gauche, le bon celle de droite :
    // leurs bords s'alignent sur la même grille
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {barre}

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 ref={titreCatalogue} tabIndex={-1} className="font-semibold text-foreground outline-none">
                Catalogue
                {fournisseur && <span className="font-normal text-muted-foreground"> · {fournisseur.nom}</span>}
              </h4>
              {!catalogueVide && !importOuvert && !fournisseurs.chargementCatalogue && (
                <Bouton ref={boutonImport} variante="secondaire" taille="sm" onClick={() => setImportOuvert(true)}>
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  Importer un CSV
                </Bouton>
              )}
            </div>

            {(catalogueVide || importOuvert) && (
              <ImportCatalogue
                enCours={enCours}
                onImporter={importer}
                onFermer={catalogueVide ? undefined : () => setImportOuvert(false)}
              />
            )}

            <GrilleCatalogue
              catalogue={catalogue}
              stocks={stocks}
              bon={bonCommande.bon}
              chargement={fournisseurs.chargementCatalogue}
              erreur={fournisseurs.erreurCatalogue}
              onRecharger={fournisseurs.rechargerCatalogue}
              onAjouter={bonCommande.ajouter}
            />
          </div>
        </div>

        <BonCommande
          bon={bonCommande.bon}
          total={bonCommande.total}
          nomFournisseur={fournisseur?.nom}
          enCours={enCours}
          onIncrementer={bonCommande.incrementer}
          onDecrementer={bonCommande.decrementer}
          onModifierQuantite={bonCommande.modifierQuantite}
          onValider={validerBon}
        />
      </div>
    );
  };

  return (
    <div className="space-y-10">
      <section aria-labelledby="titre-passer-commande">
        {/* L'onglet « Réapprovisionnement » nomme déjà la zone : le titre ne sert qu'aux lecteurs d'écran */}
        <h3 id="titre-passer-commande" className="sr-only">
          Passer commande
        </h3>
        {rendreCommande()}
      </section>

      <TableauCommandesFournisseurs
        commandes={commandes}
        fournisseur={fournisseur ? { id: fournisseur.id, nom: fournisseur.nom } : null}
        chargement={chargementCommandes}
        erreur={erreurCommandes}
        enCours={enCours}
        onRecharger={rechargerCommandes}
        onVoirDetails={setIdCommandeDetail}
        onChangerStatut={changerStatutCommande}
      />

      {commandeDetail && (
        <ModalDetailsCommande
          commande={commandeDetail}
          stocks={stocks}
          onClose={() => setIdCommandeDetail(null)}
        />
      )}

      <ModalConfirmation {...modaleProps} />

      <MessageFlottant message={message} />
    </div>
  );
}
