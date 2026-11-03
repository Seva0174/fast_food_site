import { useState } from 'react';
import { Plus } from 'lucide-react';
import { EnTeteGroupe } from '@/components/admin/groupes/EnTeteGroupe';
import { BandeauMessage } from '@/components/ui/bandeau';
import { Bouton } from '@/components/ui/bouton';
import { useEditionExclusive } from '@/hooks/useEditionsEnCours';
import { FormulaireOption } from './FormulaireOption';
import { LigneOption } from './LigneOption';
import { aTropPeuDOptions, formulaireDepuisOption } from '@/lib/options';

// Un groupe d'options : en-tête, liste des options, ajout et modification d'une option.
// onSupprimerOption reçoit l'option (la confirmation est demandée par la modale).
export const CarteGroupeOption = ({
  groupe,
  matieresPremieres,
  onModifierGroupe,
  onSupprimerGroupe,
  onCreerOption,
  onModifierOption,
  onSupprimerOption,
}) => {
  // Une seule édition à la fois dans la modale : ici l'ajout ('ajout') ou la modification d'une option (son id)
  const { ouverte, ailleurs, ouvrir, fermer, attente } = useEditionExclusive();
  const [cible, setCible] = useState(null);
  const ajoutOuvert = ouverte && cible === 'ajout';
  const idEnEdition = ouverte ? cible : null;
  const optionEnEdition = groupe.options.find((o) => o.id === idEnEdition);
  // Pendant une édition, ici ou ailleurs, les autres boutons d'ouverture attendent
  const attendre = ouverte || ailleurs;

  const ouvrirSur = (nouvelleCible) => {
    setCible(nouvelleCible);
    ouvrir();
  };

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border bg-muted/50 px-4 py-3">
        <EnTeteGroupe groupe={groupe} onModifier={onModifierGroupe} onSupprimer={onSupprimerGroupe} />
      </div>

      <div className="space-y-3 p-4">
        {aTropPeuDOptions(groupe) && (
          <BandeauMessage
            annoncer={false}
            message={{
              type: 'erreur',
              texte: "Ce groupe impose plus de choix qu'il ne propose d'options : les clients ne pourront pas commander ce produit.",
            }}
          />
        )}
        {groupe.options.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune option pour le moment : tant qu'il est vide, ce groupe n'est pas proposé au client.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {groupe.options.map((option) => (
              <LigneOption
                key={option.id}
                option={option}
                matieresPremieres={matieresPremieres}
                nomGroupe={groupe.nom}
                enEdition={idEnEdition === option.id}
                attendre={attendre}
                attributsAttente={attente(attendre)}
                onModifier={() => ouvrirSur(option.id)}
                onSupprimer={() => onSupprimerOption(option)}
              />
            ))}
          </ul>
        )}

        {/* Modification sous la liste : la grille ne bouge pas, la ligne modifiée reste repérée */}
        {optionEnEdition && (
          <FormulaireOption
            key={optionEnEdition.id}
            matieresPremieres={matieresPremieres}
            initial={formulaireDepuisOption(optionEnEdition)}
            titre={`Modifier « ${optionEnEdition.nom} »`}
            libelleBouton="Enregistrer"
            onSoumettre={(formulaire) => onModifierOption(optionEnEdition.id, formulaire)}
            onAnnuler={fermer}
          />
        )}

        {ajoutOuvert ? (
          <FormulaireOption
            matieresPremieres={matieresPremieres}
            titre={`Nouvelle option dans « ${groupe.nom} »`}
            libelleBouton="Ajouter l'option"
            continuer
            onSoumettre={(formulaire) => onCreerOption(groupe.id, formulaire)}
            onAnnuler={fermer}
          />
        ) : (
          <Bouton
            variante="fantome"
            taille="sm"
            className="-ml-2"
            {...attente(attendre)}
            onClick={() => !attendre && ouvrirSur('ajout')}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Ajouter une option
          </Bouton>
        )}
      </div>
    </section>
  );
};
