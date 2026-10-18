import { BandeauMessage } from '@/components/ui/bandeau';
import { FormulaireGroupe } from '@/components/admin/groupes/FormulaireGroupe';
import { ModalConfirmation } from '@/components/modales/ModalConfirmation';
import { ModalShell } from '@/components/modales/ModalShell';
import { Bouton } from '@/components/ui/bouton';
import { useCompositionFormule } from '@/hooks/useCompositionFormule';
import { useConfirmation } from '@/hooks/useConfirmation';
import { CarteEmplacement } from './CarteEmplacement';

export function GestionFormuleModal({ formule, produits, onClose, onRefresh }) {
  const {
    groupes,
    chargement,
    erreur,
    message,
    creerGroupe,
    modifierGroupe,
    supprimerGroupe,
    ajouterProduit,
    modifierSurcout,
    retirerProduit,
  } = useCompositionFormule(formule.id, onRefresh);
  const { confirmer, modaleProps } = useConfirmation();

  const demanderSuppressionGroupe = async (groupe) => {
    const confirme = await confirmer({
      titre: "Supprimer l'emplacement",
      message: `Supprimer l'emplacement "${groupe.nom}" et la liste de ses produits ?`,
      libelleConfirmer: 'Supprimer',
    });
    if (confirme) await supprimerGroupe(groupe.id);
  };

  return (
    <>
      <ModalShell
        titre={
          <>
            Composition du menu — <span className="text-red-600">{formule.nom}</span>
          </>
        }
        sousTitre="Définissez les emplacements du menu (ex : Ton burger, Ta boisson) et les produits proposés dans chacun. Le surcoût s'ajoute au prix de base quand le client choisit ce produit."
        largeur="max-w-4xl"
        onClose={onClose}
        actions={
          <Bouton variante="neutre" taille="sm" onClick={onClose}>
            Fermer
          </Bouton>
        }
      >
        <BandeauMessage message={message} />

        {chargement && <p className="text-sm text-gray-500">Chargement de la composition...</p>}
        {erreur && <p className="text-sm text-red-500">{erreur}</p>}

        {!chargement && !erreur && (
          <>
            <FormulaireGroupe
              titre="+ Nouvel emplacement"
              placeholderNom="ex : Ton accompagnement"
              libelleBouton="Créer l'emplacement"
              libelleNom="Nom"
              libelleMin="Min. de choix"
              aideMin=""
              libelleMax="Max. de choix"
              onCreer={creerGroupe}
            />

            <div className="space-y-4">
              {groupes.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">
                  Aucun emplacement. Tant que le menu n'en possède pas, il reste indisponible pour les clients.
                </p>
              ) : (
                groupes.map((groupe) => (
                  <CarteEmplacement
                    key={groupe.id}
                    groupe={groupe}
                    produits={produits}
                    onModifierGroupe={modifierGroupe}
                    onSupprimerGroupe={demanderSuppressionGroupe}
                    onAjouterProduit={ajouterProduit}
                    onModifierSurcout={modifierSurcout}
                    onRetirerProduit={retirerProduit}
                  />
                ))
              )}
            </div>
          </>
        )}
      </ModalShell>

      <ModalConfirmation {...modaleProps} />
    </>
  );
}