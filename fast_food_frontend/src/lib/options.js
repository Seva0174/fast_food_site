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
  if (min === 0) return `Optionnel (jusqu'à ${max} produit(s))`;
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

// Un groupe est obligatoire quand il impose au moins un choix.
export const estObligatoire = (groupe) => groupe.minSelection > 0;

// Renvoie le message d'erreur d'une règle de sélection invalide, ou null si elle est valide.
export const erreurRegleSelection = (min, max) => {
  if (Number.isNaN(min) || Number.isNaN(max)) {
    return 'Les sélections minimale et maximale doivent être des nombres.';
  }
  if (min < 0) return 'La sélection minimale ne peut pas être négative.';
  if (max < 1) return "La sélection maximale doit être d'au moins 1.";
  if (min > max) return 'La sélection minimale ne peut pas dépasser la sélection maximale.';
  return null;
};

// Corps de la requête de création ou de modification d'un groupe.
export const construirePayloadGroupe = (formulaire) => ({
  nom: formulaire.nom.trim(),
  minSelection: parseInt(formulaire.minSelection, 10),
  maxSelection: parseInt(formulaire.maxSelection, 10),
  ...(formulaire.ordre !== undefined && { ordre: parseInt(formulaire.ordre, 10) }),
});

// Renvoie le message d'erreur d'un groupe invalide, ou null s'il est valide.
export const erreurGroupe = ({ nom, minSelection, maxSelection, ordre }) => {
  if (!nom) return 'Le nom du groupe est obligatoire.';
  if (ordre !== undefined && (Number.isNaN(ordre) || ordre < 0)) {
    return "L'ordre doit être un nombre positif ou nul.";
  }
  return erreurRegleSelection(minSelection, maxSelection);
};

export const aTropPeuDOptions = (groupe) => groupe.minSelection > groupe.options.length;

// Valeurs du formulaire d'une option existante.
export const formulaireDepuisOption = (option) => ({
  nom: option.nom,
  idMatiere: String(option.idMatiere),
  quantiteDeduite: String(option.quantiteDeduite),
  surcout: String(option.surcout ?? 0),
});

// Le nom suit la matière première tant qu'il est vide ou n'a pas été personnalisé.
export const proposerNomOption = (nomActuel, nomMatierePrecedente, nomMatiereChoisie) =>
  !nomActuel.trim() || nomActuel === nomMatierePrecedente ? nomMatiereChoisie : nomActuel;

// Corps de la requête de création ou de modification d'une option.
export const construirePayloadOption = (formulaire) => ({
  nom: formulaire.nom.trim(),
  surcout: parseFloat(formulaire.surcout || 0),
  matierePremiereId: Number(formulaire.idMatiere),
  quantiteDeduite: parseFloat(formulaire.quantiteDeduite),
});

// Renvoie le message d'erreur d'une option invalide, ou null si elle est valide.
export const erreurOption = ({ nom, matierePremiereId, surcout, quantiteDeduite }) => {
  if (!nom) return "Le nom de l'option est obligatoire.";
  if (!matierePremiereId) return 'Choisissez une matière première.';
  if (Number.isNaN(quantiteDeduite) || quantiteDeduite <= 0) {
    return 'La quantité déduite doit être supérieure à 0.';
  }
  if (Number.isNaN(surcout) || surcout < 0) return 'Le surcoût ne peut pas être négatif.';
  return null;
};