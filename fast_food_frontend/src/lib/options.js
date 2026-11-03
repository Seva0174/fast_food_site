export const estRadio = (groupe) => groupe.minSelection === 1 && groupe.maxSelection === 1;

export const selectionsInitiales = (groupes, itemPanier) => {
  const existants = itemPanier?.options ?? itemPanier?.optionItemIds ?? [];
  const ids = existants.map((opt) => (typeof opt === 'object' ? opt.id : opt));

  return groupes.reduce((acc, groupe) => {
    const choisis = groupe.options.filter((item) => ids.includes(item.id)).map((item) => item.id);
    if (choisis.length > 0) acc[groupe.id] = choisis;
    return acc;
  }, {});
};

export const calculerSurcouts = (groupes, selections) =>
  groupes.reduce((total, groupe) => {
    const choisis = selections[groupe.id] ?? [];
    const surcoutGroupe = groupe.options
      .filter((item) => choisis.includes(item.id))
      .reduce((somme, item) => somme + Number(item.surcout ?? 0), 0);
    return total + surcoutGroupe;
  }, 0);

// Libelle court affiche sur un groupe d'options : Obligatoire ou Optionnel, avec le maximum.
export const libelleTypeGroupe = (groupe) =>
  `${groupe.minSelection > 0 ? 'Obligatoire' : 'Optionnel'}${
    groupe.maxSelection > 1 ? ` (max ${groupe.maxSelection})` : ''
  }`;

// Phrase expliquant la regle d'un emplacement de menu.
export const decrireRegle = (groupe) => {
  const { minSelection: min, maxSelection: max } = groupe;
  if (min === 1 && max === 1) return 'Choisissez 1 produit';
  if (min === max) return `Choisissez ${max} produits`;
  if (min === 0) return `Optionnel (jusqu'à ${max} produit${max > 1 ? 's' : ''})`;
  return `Choisissez de ${min} à ${max} produits`;
};

// Nombre d'options d'un groupe qui figurent dans la liste d'identifiants choisis.
export const nombreOptionsChoisies = (groupe, optionIds) =>
  groupe.options.filter((item) => optionIds.includes(item.id)).length;

// Regle unique du minimum : vrai si le nombre de choix est inferieur au minimum du groupe.
// Valable pour un groupe d'options comme pour un emplacement de menu.
export const estSousMinimum = (groupe, nombreChoisi) => nombreChoisi < groupe.minSelection;

// Renvoie la liste des groupes dont le nombre d'options choisies est inferieur au minimum.
export const groupesNonValides = (groupes, optionIds) =>
  groupes.filter((groupe) => estSousMinimum(groupe, nombreOptionsChoisies(groupe, optionIds)));

// Details des options choisies (id, nom, surcout), pour l'affichage et le calcul du prix.
export const detaillerOptions = (groupes, optionIds) =>
  groupes.flatMap((groupe) =>
    groupe.options
      .filter((item) => optionIds.includes(item.id))
      .map((item) => ({ id: item.id, nom: item.nom, surcout: Number(item.surcout ?? 0) }))
  );

// --- Administration : groupes d'options et options ---

export const FORMULAIRE_GROUPE_VIDE = { nom: '', minSelection: 1, maxSelection: 1 };

export const FORMULAIRE_OPTION_VIDE = { nom: '', idMatiere: '', quantiteDeduite: '1', surcout: '0' };

// Corps de la requête de création ou de modification d'un groupe.
export const construirePayloadGroupe = (formulaire) => ({
  nom: formulaire.nom.trim(),
  minSelection: parseInt(formulaire.minSelection, 10),
  maxSelection: parseInt(formulaire.maxSelection, 10),
  ...(formulaire.ordre !== undefined && { ordre: parseInt(formulaire.ordre, 10) }),
});

// Un groupe qui demande plus de choix qu'il n'a d'options bloque la commande.
// Un groupe vide n'est pas concerné : la carte client le masque (voir preparerCarte).
export const aTropPeuDOptions = (groupe) =>
  groupe.options.length > 0 && groupe.minSelection > groupe.options.length;

// Valeurs du formulaire d'une option existante.
// Une option sans ingrédient du stock (ex : une sauce non suivie) n'a ni matière ni quantité.
export const formulaireDepuisOption = (option) => ({
  nom: option.nom,
  idMatiere: option.idMatiere ? String(option.idMatiere) : '',
  quantiteDeduite: option.quantiteDeduite ? String(option.quantiteDeduite) : '1',
  surcout: String(option.surcout ?? 0),
});

// Le nom suit la matière première tant qu'il est vide ou n'a pas été personnalisé.
export const proposerNomOption = (nomActuel, nomMatierePrecedente, nomMatiereChoisie) =>
  !nomActuel.trim() || nomActuel === nomMatierePrecedente ? nomMatiereChoisie : nomActuel;

// Corps de la requête de création ou de modification d'une option.
// Sans ingrédient, rien n'est retiré du stock : ni matière ni quantité.
export const construirePayloadOption = (formulaire) => ({
  nom: formulaire.nom.trim(),
  surcout: parseFloat(formulaire.surcout || 0),
  matierePremiereId: formulaire.idMatiere ? Number(formulaire.idMatiere) : null,
  quantiteDeduite: formulaire.idMatiere ? parseFloat(formulaire.quantiteDeduite) : null,
});

// Règle d'un groupe en clair, pour l'administration : « Choix unique, obligatoire », « Facultatif, jusqu'à 3 choix »...
export const libelleRegleGroupe = ({ minSelection: min, maxSelection: max }) => {
  if (max === 1) return min > 0 ? 'Choix unique, obligatoire' : 'Choix unique, facultatif';
  if (min === 0) return `Facultatif, jusqu'à ${max} choix`;
  if (min === max) return `Obligatoire, ${max} choix`;
  return `Obligatoire, ${min} à ${max} choix`;
};

const seulementSiErreurs = (erreurs) => (Object.keys(erreurs).length > 0 ? erreurs : null);

// Erreurs de saisie d'un groupe ou d'un emplacement, champ par champ, ou null.
// Messages courts : ils s'affichent sous des champs étroits.
export const erreursGroupe = ({ nom, minSelection, maxSelection, ordre }) => {
  const erreurs = {};
  if (!nom) erreurs.nom = 'Donnez un nom.';
  if (Number.isNaN(minSelection) || minSelection < 0) erreurs.minSelection = 'Positif ou nul.';
  if (Number.isNaN(maxSelection) || maxSelection < 1) erreurs.maxSelection = 'Au moins 1.';
  if (!erreurs.minSelection && !erreurs.maxSelection && minSelection > maxSelection) {
    erreurs.minSelection = 'Pas plus que le max.';
  }
  if (ordre !== undefined && (Number.isNaN(ordre) || ordre < 0)) erreurs.ordre = 'Positif ou nul.';
  return seulementSiErreurs(erreurs);
};

// Erreurs de saisie d'une option, champ par champ ({ nom, quantiteDeduite, surcout }), ou null.
// L'ingrédient est facultatif ; la quantité n'est vérifiée que s'il y en a un.
export const erreursOption = ({ nom, matierePremiereId, surcout, quantiteDeduite }) => {
  const erreurs = {};
  if (!nom) erreurs.nom = 'Donnez le nom affiché au client.';
  if (matierePremiereId && (Number.isNaN(quantiteDeduite) || quantiteDeduite <= 0)) {
    erreurs.quantiteDeduite = 'Quantité supérieure à 0.';
  }
  if (Number.isNaN(surcout) || surcout < 0) erreurs.surcout = 'Surcoût positif ou nul.';
  return seulementSiErreurs(erreurs);
};
