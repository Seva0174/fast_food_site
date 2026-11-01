import { useState } from 'react';
import {
  calculerSurcouts,
  estRadio,
  estSousMinimum,
  groupesNonValides,
  selectionsInitiales,
} from '../lib/options';

// Gere les choix d'options d'un produit : selection, validation et surcout.
export const useSelectionOptions = (groupes, itemPanier) => {
  const [initiales] = useState(() => selectionsInitiales(groupes, itemPanier));
  const [selections, setSelections] = useState(initiales);
  const [erreurs, setErreurs] = useState({});

  const optionIds = Object.values(selections).flat();

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

    // L'erreur du groupe disparait des que le minimum est atteint
    if (!estSousMinimum(groupe, nouveaux.length)) {
      setErreurs((prev) => ({ ...prev, [groupe.id]: null }));
    }
  };

  // Vrai si l'utilisateur a change quelque chose : fermer demande alors confirmation
  const aDesModifications = JSON.stringify(selections) !== JSON.stringify(initiales);

  // Renvoie le premier groupe invalide (pour y amener l'utilisateur), ou null si tout est bon.
  const verifier = () => {
    const invalides = groupesNonValides(groupes, optionIds);

    setErreurs(
      Object.fromEntries(
        invalides.map((groupe) => [
          groupe.id,
          estRadio(groupe)
            ? 'Choisissez une option.'
            : `Choisissez au moins ${groupe.minSelection} option${groupe.minSelection > 1 ? 's' : ''}.`,
        ])
      )
    );

    return invalides[0] ?? null;
  };

  return {
    selections,
    erreurs,
    choisir,
    verifier,
    aDesModifications,
    optionIds,
    surcout: calculerSurcouts(groupes, selections),
  };
};