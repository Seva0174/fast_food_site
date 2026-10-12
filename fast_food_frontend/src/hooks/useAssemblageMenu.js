import { useState } from 'react';
import {
  basculerOptionChoisie,
  basculerProduitChoisi,
  calculerPrixMenu,
  construireChoixFormule,
  construireEtapes,
  choixDuGroupe,
  erreurEtape,
  groupesFormuleDe,
  selectionsDepuisPanier,
} from '../lib/formule';

export const useAssemblageMenu = ({ formule, produits, itemPanier }) => {
  const groupes = groupesFormuleDe(formule);
  const [selections, setSelections] = useState(() =>
    selectionsDepuisPanier(groupes, itemPanier?.composants)
  );
  const [indexEtape, setIndexEtape] = useState(0);
  const [erreur, setErreur] = useState('');

  const etapes = construireEtapes(groupes, selections, produits);
  const indexCourant = Math.min(indexEtape, Math.max(etapes.length - 1, 0));
  const etape = etapes[indexCourant];
  const estDerniereEtape = indexCourant === etapes.length - 1;

  const majSelections = (transformation) => {
    setErreur('');
    setSelections(transformation);
  };

  const choisirProduit = (groupe, lien) =>
    majSelections((prev) => basculerProduitChoisi(prev, groupe, lien));

  const choisirOption = (groupe, idProduit, groupeOption, idItem) =>
    majSelections((prev) =>
      basculerOptionChoisie(prev, groupe, idProduit, groupeOption, idItem)
    );

  const suivant = () => {
    const message = erreurEtape(etape, selections);
    if (message) {
      setErreur(message);
      return;
    }
    setErreur('');
    setIndexEtape(indexCourant + 1);
  };

  const precedent = () => {
    setErreur('');
    setIndexEtape(Math.max(indexCourant - 1, 0));
  };

  // Renvoie le choix final si tout est valide, sinon affiche la premiere erreur et renvoie null.
  const valider = () => {
    const indexErreur = etapes.findIndex((e) => erreurEtape(e, selections));
    if (indexErreur !== -1) {
      setIndexEtape(indexErreur);
      setErreur(erreurEtape(etapes[indexErreur], selections));
      return null;
    }
    return construireChoixFormule(groupes, selections, produits);
  };

  return {
    etapes,
    etape,
    indexCourant,
    estDerniereEtape,
    selections,
    erreur,
    prixTotal: calculerPrixMenu(formule, groupes, selections, produits),
    choisirProduit,
    choisirOption,
    suivant,
    precedent,
    valider,
    choixDuGroupe,
  };
};