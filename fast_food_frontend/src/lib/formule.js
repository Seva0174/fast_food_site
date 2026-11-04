import { estRadio, estSousMinimum, groupesNonValides } from './options';
import { formaterPrix } from './prix';

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
    if (estSousMinimum(groupe, choixDuGroupe(selections, groupe).length)) {
      return groupe.maxSelection === 1
        ? `Faites un choix pour « ${groupe.nom} ».`
        : `Choisis au moins ${groupe.minSelection} produits pour « ${groupe.nom} ».`;
    }
    return null;
  }

  const manquants = groupesOptionsEnErreur(etape, selections);
  return manquants.length > 0 ? messageGroupeOptions(manquants[0]) : null;
};

// Message d'un groupe d'options incomplet, adapte au choix unique ou multiple.
export const messageGroupeOptions = (groupe) =>
  estRadio(groupe)
    ? `Choisis une option pour « ${groupe.nom} ».`
    : `Choisis au moins ${groupe.minSelection} option${groupe.minSelection > 1 ? 's' : ''} pour « ${groupe.nom} ».`;

// Tous les groupes d'options incomplets d'un ecran d'options : ils sont signales en une fois.
export const groupesOptionsEnErreur = (etape, selections) => {
  if (etape?.type !== 'options') return [];
  const choix =
    choixDuGroupe(selections, etape.groupe).find((c) => c.idProduit === etape.choix.idProduit) ??
    etape.choix;
  return groupesNonValides(optionsDuProduit(etape.produit), choix.optionIds);
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

// --- Administration : composition d'un menu ---

export const FORMULAIRE_PRODUIT_FORMULE_VIDE = { idProduit: '', surcout: '0' };

// Renvoie le message d'erreur d'un surcoût invalide, ou null s'il est valide.
export const erreurSurcout = (surcout) =>
  Number.isNaN(surcout) || surcout < 0 ? 'Surcoût positif ou nul.' : null;

// Produits simples qui ne figurent pas encore dans l'emplacement.
export const produitsAjoutables = (produits, groupe) =>
  (produits ?? []).filter(
    (p) => !p.estFormule && !groupe.produits.some((lien) => lien.idProduit === p.id)
  );

// Regroupe des produits par catégorie, au format attendu par ListeDeroulante (prop "groupes").
export const grouperParCategorie = (produits) => {
  const parCategorie = {};
  produits.forEach((p) => {
    const libelle = p.categorie?.nom || 'Autres';
    (parCategorie[libelle] ??= []).push({
      value: p.id,
      label: `${p.nom} (${formaterPrix(p.prix)})`,
    });
  });
  return Object.entries(parCategorie).map(([libelle, options]) => ({ libelle, options }));
};

// Nombre de produits en vente qui manquent à un emplacement pour atteindre son minimum de choix
// (0 si l'emplacement est complet). Un produit hors vente ne compte pas : le client ne peut pas le choisir.
export const produitsManquants = (groupe) =>
  Math.max(0, groupe.minSelection - (groupe.produits ?? []).filter((lien) => lien.estDispo).length);

// Phrase courte d'un emplacement incomplet (« Il manque 1 produit en vente »), ou null.
export const manqueEmplacement = (groupe) => {
  const manque = produitsManquants(groupe);
  if (manque === 0) return null;
  return `Il manque ${manque} produit${manque > 1 ? 's' : ''} en vente`;
};

// Corps de la requête d'ajout d'un produit dans un emplacement.
export const construirePayloadProduitFormule = (formulaire) => ({
  idProduit: Number(formulaire.idProduit),
  surcout: parseFloat(formulaire.surcout || 0),
});
// Resume des choix d'un menu, emplacement par emplacement (recapitulatif avant enregistrement).
export const resumerSelections = (groupes, selections, produits) =>
  groupes.map((groupe) => ({
    groupe,
    choix: choixDuGroupe(selections, groupe).map((choix) => {
      const lien = trouverLien(groupe, choix.idProduit);
      const nomsOptions = optionsDuProduit(trouverProduit(produits, choix.idProduit))
        .flatMap((g) => g.options)
        .filter((item) => choix.optionIds.includes(item.id))
        .map((item) => item.nom);
      return { idProduit: choix.idProduit, nom: lien?.nomProduit ?? '', options: nomsOptions };
    }),
  }));

// Emplacements dans leur ordre d'affichage.
export const trierEmplacements = (groupes) => [...groupes].sort((a, b) => a.ordre - b.ordre);

// Déplace un emplacement d'un cran (sens : -1 vers le haut, 1 vers le bas).
// Renvoie les emplacements dont l'ordre change, avec leur nouvel ordre (1, 2, 3...) : [{ groupe, ordre }].
export const reordonnerEmplacements = (groupes, idGroupe, sens) => {
  const tries = trierEmplacements(groupes);
  const index = tries.findIndex((g) => g.id === idGroupe);
  const cible = index + sens;
  if (index < 0 || cible < 0 || cible >= tries.length) return [];
  [tries[index], tries[cible]] = [tries[cible], tries[index]];
  return tries
    .map((groupe, i) => ({ groupe, ordre: i + 1 }))
    .filter(({ groupe, ordre }) => groupe.ordre !== ordre);
};
