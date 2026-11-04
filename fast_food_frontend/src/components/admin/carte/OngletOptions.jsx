import { Plus } from 'lucide-react';
import { FormulaireGroupe } from '@/components/admin/groupes/FormulaireGroupe';
import { ModalConfirmation } from '@/components/modales/ModalConfirmation';
import { BandeauMessage } from '@/components/ui/bandeau';
import { Bouton } from '@/components/ui/bouton';
import { HorsModale } from '@/components/ui/hors-modale';
import { MessageFlottant } from '@/components/ui/message-flottant';
import { useConfirmation } from '@/hooks/useConfirmation';
import { useEditionExclusive } from '@/hooks/useEditionsEnCours';
import { useOptionsProduit } from '@/hooks/useOptionsProduit';
import { CarteGroupeOption } from './CarteGroupeOption';

// Onglet « Options » de la fiche d'un produit simple : groupes d'options (viande, sauces…) et leurs règles.
// Chaque changement s'enregistre tout de suite ; onRefresh recharge la carte.
export function OngletOptions({ produit, matieresPremieres, onRefresh }) {
  const {
    groupes,
    chargement,
    erreur,
    message,
    charger,
    creerGroupe,
    modifierGroupe,
    supprimerGroupe,
    creerOption,
    modifierOption,
    supprimerOption,
  } = useOptionsProduit(produit.id, onRefresh);
  const { confirmer, modaleProps } = useConfirmation();
  // La création d'un groupe est une édition comme les autres : une seule à la fois dans la fiche
  const creation = useEditionExclusive();

  const demanderSuppressionGroupe = async (groupe) => {
    const confirme = await confirmer({
      titre: 'Supprimer le groupe ?',
      message: `Le groupe « ${groupe.nom} » et ses ${groupe.options.length} option${
        groupe.options.length > 1 ? 's' : ''
      } ne seront plus proposés aux clients. Cette action est irréversible.`,
      libelleConfirmer: 'Supprimer le groupe',
      libelleRefuser: 'Garder',
      destructif: true,
    });
    if (confirme) await supprimerGroupe(groupe.id);
  };

  const demanderSuppressionOption = async (groupe, option) => {
    const confirme = await confirmer({
      titre: "Supprimer l'option ?",
      message: `« ${option.nom} » ne sera plus proposé dans « ${groupe.nom} ». Cette action est irréversible.`,
      libelleConfirmer: "Supprimer l'option",
      libelleRefuser: 'Garder',
      destructif: true,
    });
    if (confirme) await supprimerOption(option.id);
  };

  const creer = async (formulaire) => {
    const cree = await creerGroupe(formulaire);
    if (cree) creation.fermer();
    return cree;
  };

  // Sans groupe, le formulaire de création est la seule chose à faire : il est ouvert d'emblée
  const formulaireVisible = creation.ouverte || groupes.length === 0;

  return (
    <div className="space-y-4">
      {chargement && (
        <p role="status" className="text-sm text-muted-foreground">
          Chargement des options…
        </p>
      )}
      {erreur && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <BandeauMessage message={{ texte: erreur, type: 'erreur' }} className="flex-1" />
          <Bouton variante="secondaire" onClick={charger}>
            Réessayer
          </Bouton>
        </div>
      )}

      {!chargement && !erreur && (
        <>
          {groupes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Ce produit n'a pas encore d'options : il est vendu tel quel. Crée un groupe pour proposer des choix
              au client (viande, sauces…).
            </p>
          )}

          {groupes.map((groupe) => (
            <CarteGroupeOption
              key={groupe.id}
              groupe={groupe}
              matieresPremieres={matieresPremieres}
              onModifierGroupe={modifierGroupe}
              onSupprimerGroupe={demanderSuppressionGroupe}
              onCreerOption={creerOption}
              onModifierOption={modifierOption}
              onSupprimerOption={(option) => demanderSuppressionOption(groupe, option)}
            />
          ))}

          {formulaireVisible ? (
            <FormulaireGroupe
              titre="Nouveau groupe d'options"
              placeholderNom="ex : Choix de la viande"
              libelleBouton="Créer le groupe"
              onCreer={creer}
              onAnnuler={groupes.length > 0 ? creation.fermer : undefined}
            />
          ) : (
            <Bouton
              variante="secondaire"
              taille="sm"
              {...creation.attente(creation.ailleurs)}
              onClick={() => !creation.ailleurs && creation.ouvrir()}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nouveau groupe d'options
            </Bouton>
          )}
        </>
      )}

      <HorsModale>
        <ModalConfirmation {...modaleProps} />
        <MessageFlottant message={message} />
      </HorsModale>
    </div>
  );
}
