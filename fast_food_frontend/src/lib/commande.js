import { formaterSupplement } from './prix';

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

// Delai entre deux actualisations automatiques de la liste (page staff).
export const INTERVALLE_ACTUALISATION_MS = 30_000;

// Parcours normal d'une commande, sans l'annulation.
const parcoursStatuts = (commande) =>
  statutsProposes(commande)
    .map((statut) => statut.value)
    .filter((valeur) => valeur !== STATUT_COMMANDE.ANNULEE);

// Libelle du bouton qui fait passer la commande a l'etape suivante.
export const LIBELLES_ACTION_STATUT = {
  [STATUT_COMMANDE.EN_PREPARATION]: 'Passer en préparation',
  [STATUT_COMMANDE.PRETE]: 'Marquer prête',
  [STATUT_COMMANDE.LIVREE]: 'Marquer livrée',
  [STATUT_COMMANDE.RETIREE]: 'Marquer retirée',
};

// Statut suivant dans le parcours, ou null si la commande est terminee ou annulee.
export const statutSuivant = (commande) => {
  const parcours = parcoursStatuts(commande);
  const index = parcours.indexOf(commande.status);
  return index >= 0 && index < parcours.length - 1 ? parcours[index + 1] : null;
};

// Statut precedent (pour corriger une erreur de manipulation), ou null en premiere etape.
export const statutPrecedent = (commande) => {
  const index = parcoursStatuts(commande).indexOf(commande.status);
  return index > 0 ? parcoursStatuts(commande)[index - 1] : null;
};

// Nombre d'articles commandes (seules les lignes principales sont dans "items").
export const nombreArticles = (commande) =>
  commande.items.reduce((total, item) => total + item.quantite, 0);

const dateDe = (commande) => new Date(commande.dateCreation);

export const heureCommande = (commande) =>
  dateDe(commande).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

export const dateCommande = (commande) => dateDe(commande).toLocaleDateString('fr-FR');

// Heure "10:30" d'une date (ex : derniere actualisation de la liste).
export const formaterHeure = (date) =>
  date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

// "il y a 8 min", "il y a 1 h 05", puis la date au-dela de 24 h.
export const ancienneteCommande = (commande, maintenant = Date.now()) => {
  const minutes = Math.max(0, Math.floor((maintenant - dateDe(commande).getTime()) / 60000));
  if (minutes < 1) return 'à l’instant';
  if (minutes < 60) return `il y a ${minutes} min`;
  if (minutes < 24 * 60) {
    return `il y a ${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')}`;
  }
  return dateCommande(commande);
};

// "Aujourd'hui à 10:30" pour une commande du jour, sinon "Le 14/10/2026 à 15:16".
export const momentCommande = (commande, maintenant = new Date()) => {
  const date = dateDe(commande);
  const memeJour = date.toDateString() === maintenant.toDateString();
  return `${memeJour ? 'Aujourd’hui' : `Le ${dateCommande(commande)}`} à ${heureCommande(commande)}`;
};

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
  return surcout > 0 ? `${option.nomOption} (${formaterSupplement(surcout)})` : option.nomOption;
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
// --- Suivi d'une commande en cours (compte client) ---

// Etapes affichees pour une commande en cours ; la derniere depend du mode de retrait.
export const etapesSuivi = (commande) => [
  // Meme formulation que le ticket de confirmation ("Commande envoyée en cuisine")
  'Envoyée en cuisine',
  'En préparation',
  estClickAndCollect(commande) ? 'Prête à retirer' : 'Prête à livrer',
];

// Index de l'etape atteinte (0 a 2), ou -1 si la commande n'est plus suivie (terminee).
export const etapeSuivi = (commande) => {
  const index = [
    STATUT_COMMANDE.EN_ATTENTE,
    STATUT_COMMANDE.EN_PREPARATION,
    STATUT_COMMANDE.PRETE,
  ].indexOf(commande.status);
  return estEnCours(commande) ? index : -1;
};

// Commandes triees de la plus recente a la plus ancienne, avec celle a mettre en avant en tete.
export const ordonnerCommandesClient = (commandes, idEnAvant) =>
  [...commandes].sort((a, b) => {
    if (a.id === idEnAvant) return -1;
    if (b.id === idEnAvant) return 1;
    return new Date(b.dateCreation) - new Date(a.dateCreation);
  });

// Commande que le client vient de passer : en cours et creee il y a moins de 30 minutes.
// Sert a la mise en avant "passée à l'instant" (jamais sur une ancienne commande).
const DELAI_RECENTE_MS = 30 * 60 * 1000;
export const estRecente = (commande, maintenant = Date.now()) =>
  estEnCours(commande) && maintenant - new Date(commande.dateCreation).getTime() < DELAI_RECENTE_MS;
