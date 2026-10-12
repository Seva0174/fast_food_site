import { estRadio, groupesNonValides } from './options';

// Options d'un produit, telles que renvoyees par l'API : chaque groupe contient "options".
const optionsDuProduit = (produit) => produit?.groupesOptions ?? [];

export const groupesFormuleDe = (formule) => formule?.groupesFormule ?? [];

export const choixDuGroupe = (selections, groupe) => selections[groupe.id] ?? [];

const trouverProduit = (produits, id) => produits.find((p) => p.id === id);

const trouverLien = (groupe, idProduit) => groupe.produits.find((l) => l.idProduit === idProduit);

// Reconstruit les choix a partir des composants d'un article deja present dans le panier.
export const selectionsDepuisPanier = (groupes, composants = []) =>
  composants.reduce((acc, composant) => {
    const groupe = groupes.find((g) => g.id === composant.idGroupe);
    const proposeEncore = groupe?.produits.some((l) => l.idProduit === composant.produitId);
    if (!groupe || !proposeEncore) return acc;

    const optionIds = (composant.options ?? []).map((opt) =>
      typeof opt === 'object' ? opt.id : opt
    );

    return {
      ...acc,
      [groupe.id]: [...(acc[groupe.id] ?? []), { idProduit: composant.produitId, optionIds }],
    };
  }, {});

// Liste ordonnee des ecrans : un par emplacement, puis un par produit choisi qui a des options.
export const construireEtapes = (groupes, selections, produits) =>
  groupes.flatMap((groupe) => [
    { type: 'groupe', groupe },
    ...choixDuGroupe(selections, groupe).flatMap((choix) => {
      const produit = trouverProduit(produits, choix.idProduit);
      if (!produit || optionsDuProduit(produit).length === 0) return [];
      return [{ type: 'options', groupe, choix, produit }];
    }),
  ]);

const surcoutOptions = (produit, optionIds) =>
  optionsDuProduit(produit).reduce(
    (total, groupeOption) =>
      total +
      groupeOption.options
        .filter((item) => optionIds.includes(item.id))
        .reduce((somme, item) => somme + Number(item.surcout ?? 0), 0),
    0
  );

export const calculerSupplement = (groupe, choix, produits) => {
  const lien = trouverLien(groupe, choix.idProduit);
  const produit = trouverProduit(produits, choix.idProduit);
  return Number(lien?.surcout ?? 0) + surcoutOptions(produit, choix.optionIds);
};

export const calculerPrixMenu = (formule, groupes, selections, produits) =>
  groupes.reduce(
    (total, groupe) =>
      total +
      choixDuGroupe(selections, groupe).reduce(
        (somme, choix) => somme + calculerSupplement(groupe, choix, produits),
        0
      ),
    Number(formule?.prix ?? 0)
  );

// Renvoie le message d'erreur de l'etape, ou null si elle est valide.
export const erreurEtape = (etape, selections) => {
  if (!etape) return null;

  if (etape.type === 'groupe') {
    const { groupe } = etape;
    if (choixDuGroupe(selections, groupe).length < groupe.minSelection) {
      return `Veuillez choisir au moins ${groupe.minSelection} produit(s) pour : ${groupe.nom}.`;
    }
    return null;
  }

  const manquant = groupesNonValides(optionsDuProduit(etape.produit), etape.choix.optionIds)[0];

  return manquant
    ? `Veuillez sélectionner au moins ${manquant.minSelection} option(s) pour : ${manquant.nom} (${etape.produit.nom}).`
    : null;
};

export const basculerProduitChoisi = (selections, groupe, lien) => {
  if (!lien.estDispo) return selections;

  const actuels = choixDuGroupe(selections, groupe);
  const dejaChoisi = actuels.some((c) => c.idProduit === lien.idProduit);
  let nouveaux;

  if (dejaChoisi) {
    // Un emplacement a choix unique obligatoire ne peut pas etre decoche, seulement remplace
    if (groupe.maxSelection === 1 && groupe.minSelection >= 1) return selections;
    nouveaux = actuels.filter((c) => c.idProduit !== lien.idProduit);
  } else if (groupe.maxSelection === 1) {
    nouveaux = [{ idProduit: lien.idProduit, optionIds: [] }];
  } else if (actuels.length >= groupe.maxSelection) {
    return selections;
  } else {
    nouveaux = [...actuels, { idProduit: lien.idProduit, optionIds: [] }];
  }

  return { ...selections, [groupe.id]: nouveaux };
};

// groupeOption est un groupe d'options du produit, tel que renvoye par l'API (champ "options").
export const basculerOptionChoisie = (selections, groupe, idProduit, groupeOption, idItem) => ({
  ...selections,
  [groupe.id]: choixDuGroupe(selections, groupe).map((choix) => {
    if (choix.idProduit !== idProduit) return choix;

    const idsDuGroupe = groupeOption.options.map((i) => i.id);
    const dansGroupe = choix.optionIds.filter((id) => idsDuGroupe.includes(id));
    const autres = choix.optionIds.filter((id) => !idsDuGroupe.includes(id));

    let nouveauxDuGroupe;
    if (estRadio(groupeOption)) {
      nouveauxDuGroupe = [idItem];
    } else if (dansGroupe.includes(idItem)) {
      nouveauxDuGroupe = dansGroupe.filter((id) => id !== idItem);
    } else if (groupeOption.maxSelection && dansGroupe.length >= groupeOption.maxSelection) {
      nouveauxDuGroupe = dansGroupe;
    } else {
      nouveauxDuGroupe = [...dansGroupe, idItem];
    }

    return { ...choix, optionIds: [...autres, ...nouveauxDuGroupe] };
  }),
});

// Format attendu par ContextePanier : une entree par produit choisi, avec ses details d'affichage.
export const construireChoixFormule = (groupes, selections, produits) =>
  groupes.flatMap((groupe) =>
    choixDuGroupe(selections, groupe).map((choix) => {
      const produit = trouverProduit(produits, choix.idProduit);
      const lien = trouverLien(groupe, choix.idProduit);

      const optionsDetails = optionsDuProduit(produit).flatMap((groupeOption) =>
        groupeOption.options
          .filter((item) => choix.optionIds.includes(item.id))
          .map((item) => ({ id: item.id, nom: item.nom, surcout: Number(item.surcout ?? 0) }))
      );

      return {
        idGroupe: groupe.id,
        idProduit: choix.idProduit,
        optionIds: choix.optionIds,
        nomGroupe: groupe.nom,
        nomProduit: lien?.nomProduit ?? produit?.nom ?? '',
        supplement: calculerSupplement(groupe, choix, produits),
        optionsDetails,
      };
    })
  );