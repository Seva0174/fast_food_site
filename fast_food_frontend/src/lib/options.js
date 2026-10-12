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