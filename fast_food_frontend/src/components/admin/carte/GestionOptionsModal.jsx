import { BandeauMessage } from '@/components/ui/bandeau';
import { FormulaireGroupe } from '@/components/admin/groupes/FormulaireGroupe';
import { ModalConfirmation } from '@/components/modales/ModalConfirmation';
import { ModalShell } from '@/components/modales/ModalShell';
import { Bouton } from '@/components/ui/bouton';
import { useConfirmation } from '@/hooks/useConfirmation';
import { useOptionsProduit } from '@/hooks/useOptionsProduit';
import { CarteGroupeOption } from './CarteGroupeOption';

export function GestionOptionsModal({ produit, matieresPremieres, onClose, onRefresh }) {
  const {
    groupes,
    chargement,
    erreur,
    message,
    creerGroupe,
    modifierGroupe,
    supprimerGroupe,
    creerOption,
    modifierOption,
    supprimerOption,
  } = useOptionsProduit(produit.id, onRefresh);
  const { confirmer, modaleProps } = useConfirmation();

  const demanderSuppressionGroupe = async (groupe) => {
    const confirme = await confirmer({
      titre: "Supprimer le groupe d'options",
      message: `Supprimer le groupe "${groupe.nom}" et toutes ses options ?`,
      libelleConfirmer: 'Supprimer',
    });
    if (confirme) await supprimerGroupe(groupe.id);
  };

  return (
    <>
      <ModalShell
        titre={
          <>
            Gérer les Options — <span className="text-red-600">{produit.nom}</span>
          </>
        }
        sousTitre="Créez des groupes d'options (ex: Choix de la Viande, Sauces) et définissez les règles de sélection."
        largeur="max-w-4xl"
        onClose={onClose}
        actions={
          <Bouton variante="neutre" taille="sm" onClick={onClose}>
            Fermer
          </Bouton>
        }
      >
        <BandeauMessage message={message} />

        {chargement && <p className="text-sm text-gray-500">Chargement des options...</p>}
        {erreur && <p className="text-sm text-red-500">{erreur}</p>}

        {!chargement && !erreur && (
          <>
            <FormulaireGroupe
              titre="+ Nouveau groupe d'options"
              placeholderNom="ex: Choix de la Viande"
              libelleBouton="Créer le groupe"
              onCreer={creerGroupe}
            />

            <div className="space-y-4">
              {groupes.length === 0 ? (
                <p className="rounded border border-dashed bg-gray-50 py-6 text-center text-sm text-gray-400">
                  Aucun groupe d'options configuré pour ce produit.
                </p>
              ) : (
                groupes.map((groupe) => (
                  <CarteGroupeOption
                    key={groupe.id}
                    groupe={groupe}
                    matieresPremieres={matieresPremieres}
                    onModifierGroupe={modifierGroupe}
                    onSupprimerGroupe={demanderSuppressionGroupe}
                    onCreerOption={creerOption}
                    onModifierOption={modifierOption}
                    onSupprimerOption={supprimerOption}
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