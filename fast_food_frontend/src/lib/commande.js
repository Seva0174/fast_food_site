// Valeurs du champ typeRetrait attendues par le backend.
export const TYPE_RETRAIT = {
  LIVRAISON: 'livraison',
  CLICK_AND_COLLECT: 'click_and_collect',
};

// Valeurs du champ status d'une commande (voir la contrainte CHECK de la table commandes).
export const STATUT_COMMANDE = {
  EN_ATTENTE: 'en_attente',
  EN_PREPARATION: 'en_preparation',
  PRETE: 'prete',
  LIVREE: 'livree',
  RETIREE: 'retiree',
  ANNULEE: 'annulee',
};

// Une commande est terminee quand elle est livree, retiree ou annulee, quel que soit son mode de retrait.
export const STATUTS_TERMINES = [
  STATUT_COMMANDE.LIVREE,
  STATUT_COMMANDE.RETIREE,
  STATUT_COMMANDE.ANNULEE,
];

export const estTerminee = (commande) => STATUTS_TERMINES.includes(commande.status);

export const estEnCours = (commande) => !estTerminee(commande);

export const LIBELLES_STATUT = {
  [STATUT_COMMANDE.EN_ATTENTE]: 'En attente',
  [STATUT_COMMANDE.EN_PREPARATION]: 'En préparation',
  [STATUT_COMMANDE.PRETE]: 'Prête',
  [STATUT_COMMANDE.LIVREE]: 'Livrée',
  [STATUT_COMMANDE.RETIREE]: 'Retirée en restaurant',
  [STATUT_COMMANDE.ANNULEE]: 'Annulée',
};

export const estClickAndCollect = (commande) =>
  commande.typeRetrait === TYPE_RETRAIT.CLICK_AND_COLLECT;

// Statuts attribuables a une commande : l'avant-derniere etape depend du mode de retrait.
export const statutsProposes = (commande) => {
  const statutFinal = estClickAndCollect(commande)
    ? STATUT_COMMANDE.RETIREE
    : STATUT_COMMANDE.LIVREE;

  return [
    STATUT_COMMANDE.EN_ATTENTE,
    STATUT_COMMANDE.EN_PREPARATION,
    STATUT_COMMANDE.PRETE,
    statutFinal,
    STATUT_COMMANDE.ANNULEE,
  ].map((value) => ({ value, label: LIBELLES_STATUT[value] }));
};

// Nombre d'articles commandes (seules les lignes principales sont dans "items").
export const nombreArticles = (commande) =>
  commande.items.reduce((total, item) => total + item.quantite, 0);

const dateDe = (commande) => new Date(commande.dateCreation);

export const heureCommande = (commande) =>
  dateDe(commande).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

export const dateCommande = (commande) => dateDe(commande).toLocaleDateString('fr-FR');

export const dateLongueCommande = (commande) =>
  dateDe(commande).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const arrondir = (valeur) => Math.round(valeur * 100) / 100;

const surcoutOption = (option) => Number(option.surcoutHistorise);

// Libelle d'une option avec son surcout s'il y en a un : "Extra Cheddar (+1.00 €)".
export const libelleOption = (option) => {
  const surcout = surcoutOption(option);
  return surcout > 0 ? `${option.nomOption} (+${surcout.toFixed(2)} €)` : option.nomOption;
};

export const libellesOptions = (options) => options.map(libelleOption).join(', ');

// Le prix d'un composant de menu regroupe le supplement de son emplacement
// et les surcouts de ses options : on retire ces derniers pour isoler le supplement.
export const supplementEmplacement = (composant) =>
  arrondir(
    Number(composant.prix) -
      composant.options.reduce((total, option) => total + surcoutOption(option), 0)
  );

// --- Filtres, tri et compteurs (admin et compte client) ---

// Statuts proposes en filtre direct dans l'admin (les statuts termines sont regroupes).
export const STATUTS_FILTRABLES = [
  STATUT_COMMANDE.EN_ATTENTE,
  STATUT_COMMANDE.EN_PREPARATION,
  STATUT_COMMANDE.PRETE,
];

// Valeurs speciales du filtre de statut, qui regroupent plusieurs statuts.
export const FILTRE_STATUT = {
  EN_COURS: 'en_cours',
  TERMINEES: 'terminees',
};

export const FILTRE_TYPE_TOUS = 'tous';

const correspondStatut = (commande, statut) => {
  if (statut === FILTRE_STATUT.EN_COURS) return estEnCours(commande);
  if (statut === FILTRE_STATUT.TERMINEES) return estTerminee(commande);
  return commande.status === statut;
};

// Filtre par statut, type de retrait et recherche (numero de commande ou nom du client).
export const filtrerCommandes = (commandes, { statut, typeRetrait, recherche }) => {
  const terme = recherche.trim().toLowerCase();

  return commandes.filter((commande) => {
    const matchType = typeRetrait === FILTRE_TYPE_TOUS || commande.typeRetrait === typeRetrait;
    const matchRecherche =
      terme === '' ||
      String(commande.id).includes(terme) ||
      commande.nomClient?.toLowerCase().includes(terme);

    return correspondStatut(commande, statut) && matchType && matchRecherche;
  });
};

// Tri par date de creation, sans modifier le tableau d'origine.
export const trierParDate = (commandes, ordre) =>
  [...commandes].sort((a, b) => {
    const difference = new Date(a.dateCreation) - new Date(b.dateCreation);
    return ordre === 'desc' ? -difference : difference;
  });

// Compteurs affiches sur les filtres.
export const compterCommandes = (commandes) => ({
  enCours: commandes.filter(estEnCours).length,
  terminees: commandes.filter(estTerminee).length,
  parStatut: Object.fromEntries(
    STATUTS_FILTRABLES.map((statut) => [statut, commandes.filter((c) => c.status === statut).length])
  ),
});