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
  resumerSelections,
  selectionsDepuisPanier,
} from '../lib/formule';

export const useAssemblageMenu = ({ formule, produits, itemPanier }) => {
  const groupes = groupesFormuleDe(formule);
  // Choix de depart (vides, ou ceux de l'article du panier en cours de modification)
  const [selectionsInitiales] = useState(() =>
    selectionsDepuisPanier(groupes, itemPanier?.composants)
  );
  const [selections, setSelections] = useState(selectionsInitiales);
  const [indexEtape, setIndexEtape] = useState(0);
  // En modification d'un article du panier, la modale s'ouvre sur le recapitulatif des choix
  const [enRecap, setEnRecap] = useState(Boolean(itemPanier));
  const [erreur, setErreur] = useState('');
  // Compteur des validations refusees : la modale y amene le focus (pas a chaque clic)
  const [tentativesRefusees, setTentativesRefusees] = useState(0);
  const refuser = (message) => {
    setErreur(message);
    setTentativesRefusees((n) => n + 1);
  };

  const etapes = construireEtapes(groupes, selections, produits);
  const indexCourant = Math.min(indexEtape, Math.max(etapes.length - 1, 0));
  const etape = etapes[indexCourant];
  const estDerniereEtape = indexCourant === etapes.length - 1;

  // Le compteur affiche les emplacements du menu (burger, accompagnement, boisson...).
  // Les ecrans d'options sont des sous-etapes : le total ne change pas en cours de route.
  const numeroEmplacement = etape ? groupes.findIndex((g) => g.id === etape.groupe.id) + 1 : 0;

  // Vrai si l'utilisateur a change quelque chose : fermer la modale demande alors confirmation
  const aDesModifications = JSON.stringify(selections) !== JSON.stringify(selectionsInitiales);

  // Apres une validation refusee, l'erreur est recalculee a chaque choix :
  // les groupes encore incomplets restent signales, ceux qui sont corriges s'eteignent.
  const majSelections = (transformation) => {
    const nouvelles = transformation(selections);
    setSelections(nouvelles);
    if (erreur) setErreur(erreurEtape(etape, nouvelles) ?? '');
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
      refuser(message);
      return;
    }
    setErreur('');
    setIndexEtape(indexCourant + 1);
  };

  // Recapitulatif : aller directement a un emplacement pour le modifier
  const ouvrirEmplacement = (idGroupe) => {
    const index = etapes.findIndex((e) => e.type === 'groupe' && e.groupe.id === idGroupe);
    setErreur('');
    setIndexEtape(Math.max(index, 0));
    setEnRecap(false);
  };

  // Modification : valide l'etape puis revient au recapitulatif,
  // sauf si l'emplacement a encore un ecran d'options a remplir.
  // Renvoie 'recap', 'options' (ecran d'options suivant) ou false (etape invalide).
  const validerVersRecap = () => {
    const message = erreurEtape(etape, selections);
    if (message) {
      refuser(message);
      return false;
    }
    setErreur('');
    const suivante = etapes[indexCourant + 1];
    if (suivante && suivante.groupe.id === etape.groupe.id) {
      setIndexEtape(indexCourant + 1);
      return 'options';
    }
    setEnRecap(true);
    return 'recap';
  };

  const retourRecap = () => {
    setErreur('');
    setEnRecap(true);
  };

  const precedent = () => {
    setErreur('');
    setIndexEtape(Math.max(indexCourant - 1, 0));
  };

  // Renvoie le choix final si tout est valide, sinon affiche la premiere erreur et renvoie null.
  const valider = () => {
    const indexErreur = etapes.findIndex((e) => erreurEtape(e, selections));
    if (indexErreur !== -1) {
      setEnRecap(false);
      setIndexEtape(indexErreur);
      refuser(erreurEtape(etapes[indexErreur], selections));
      return null;
    }
    return construireChoixFormule(groupes, selections, produits);
  };

  return {
    etapes,
    etape,
    numeroEmplacement,
    totalEmplacements: groupes.length,
    aDesModifications,
    enRecap,
    recapitulatif: resumerSelections(groupes, selections, produits),
    ouvrirEmplacement,
    validerVersRecap,
    retourRecap,
    indexCourant,
    estDerniereEtape,
    selections,
    erreur,
    tentativesRefusees,
    prixTotal: calculerPrixMenu(formule, groupes, selections, produits),
    choisirProduit,
    choisirOption,
    suivant,
    precedent,
    valider,
    choixDuGroupe,
  };
};