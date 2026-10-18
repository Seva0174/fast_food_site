import { useState } from 'react';
import { EnTeteGroupe } from '@/components/admin/groupes/EnTeteGroupe';
import { Bouton } from '@/components/ui/bouton';
import { FormulaireOption } from './FormulaireOption';
import { LigneOption } from './LigneOption';
import { aTropPeuDOptions, formulaireDepuisOption } from '@/lib/options';

// Un groupe d'options : en-tête, liste des options, ajout et modification d'une option.
export const CarteGroupeOption = ({
  groupe,
  matieresPremieres,
  onModifierGroupe,
  onSupprimerGroupe,
  onCreerOption,
  onModifierOption,
  onSupprimerOption,
}) => {
  const [ajoutOuvert, setAjoutOuvert] = useState(false);
  const [idEnEdition, setIdEnEdition] = useState(null);

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <div className="border-b bg-gray-100 px-4 py-3">
        <EnTeteGroupe groupe={groupe} onModifier={onModifierGroupe} onSupprimer={onSupprimerGroupe} />
      </div>

      <div className="space-y-3 p-4">
        {aTropPeuDOptions(groupe) && (
          <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Ce groupe impose plus de choix que d'options proposées : les clients ne pourront pas commander
            ce produit.
          </p>
        )}
        {groupe.options.length === 0 ? (
          <p className="text-xs italic text-gray-400">
            Aucune option dans ce groupe. Ajoutez-en une ci-dessous.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {groupe.options.map((option) =>
              idEnEdition === option.id ? (
                <div key={option.id} className="sm:col-span-2">
                  <FormulaireOption
                    matieresPremieres={matieresPremieres}
                    initial={formulaireDepuisOption(option)}
                    titre={`Modifier l'option "${option.nom}"`}
                    libelleBouton="Enregistrer"
                    onSoumettre={(formulaire) => onModifierOption(option.id, formulaire)}
                    onAnnuler={() => setIdEnEdition(null)}
                  />
                </div>
              ) : (
                <LigneOption
                  key={option.id}
                  option={option}
                  onModifier={() => setIdEnEdition(option.id)}
                  onSupprimer={() => onSupprimerOption(option.id)}
                />
              )
            )}
          </div>
        )}

        {ajoutOuvert ? (
          <FormulaireOption
            matieresPremieres={matieresPremieres}
            titre={`Ajouter une option à "${groupe.nom}"`}
            libelleBouton="Enregistrer l'option"
            onSoumettre={(formulaire) => onCreerOption(groupe.id, formulaire)}
            onAnnuler={() => setAjoutOuvert(false)}
          />
        ) : (
          <Bouton variante="contour" taille="xs" onClick={() => setAjoutOuvert(true)}>
            + Ajouter une option
          </Bouton>
        )}
      </div>
    </div>
  );
};