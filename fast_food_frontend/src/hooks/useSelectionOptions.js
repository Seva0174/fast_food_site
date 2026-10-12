import { useState } from 'react';
import { calculerSurcouts, estRadio, selectionsInitiales } from '../lib/options';
import { groupesNonValides } from '../lib/options';

// Gere les choix d'options d'un produit : selection, validation et surcout.
export const useSelectionOptions = (groupes, itemPanier) => {
  const [selections, setSelections] = useState(() => selectionsInitiales(groupes, itemPanier));
  const [erreurs, setErreurs] = useState({});

  const choisir = (groupe, idItem) => {
    const actuels = selections[groupe.id] ?? [];
    let nouveaux;

    if (estRadio(groupe)) {
      nouveaux = [idItem];
    } else if (actuels.includes(idItem)) {
      nouveaux = actuels.filter((id) => id !== idItem);
    } else if (actuels.length >= groupe.maxSelection) {
      return;
    } else {
      nouveaux = [...actuels, idItem];
    }

    setSelections((prev) => ({ ...prev, [groupe.id]: nouveaux }));

    if (nouveaux.length >= groupe.minSelection) {
      setErreurs((prev) => ({ ...prev, [groupe.id]: null }));
    }
  };

  // Renvoie true si toutes les selections obligatoires sont respectees.
  const verifier = () => {
    const invalides = groupesNonValides(groupes, Object.values(selections).flat());

    setErreurs(
      Object.fromEntries(
        invalides.map((groupe) => [
          groupe.id,
          `Veuillez sélectionner au moins ${groupe.minSelection} option(s).`,
        ])
      )
    );

    return invalides.length === 0;
  };

  return {
    selections,
    erreurs,
    choisir,
    verifier,
    optionIds: Object.values(selections).flat(),
    surcout: calculerSurcouts(groupes, selections),
  };
};