// Règles des commandes fournisseurs et du bon de commande (fonctions pures).
import { formaterPrix } from './prix';
import { pasCommande, rangUrgence } from './stock';

export const STATUT_COMMANDE = {
  EN_ATTENTE: 'en_attente',
  EXPEDIEE: 'expediee',
  RECUE: 'recue',
  ANNULEE: 'annulee',
};

const BADGE = 'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold';

// Libellé et classes du badge (tokens du thème : un seul signal fort, le rouge de l'annulation ;
// les statuts finaux s'effacent).
export const STATUTS_COMMANDE = {
  [STATUT_COMMANDE.EN_ATTENTE]: {
    libelle: 'En attente',
    classe: `${BADGE} border-border bg-secondary text-secondary-foreground`,
  },
  [STATUT_COMMANDE.EXPEDIEE]: {
    libelle: 'Expédiée',
    classe: `${BADGE} border-foreground/40 text-foreground`,
  },
  [STATUT_COMMANDE.RECUE]: {
    libelle: 'Reçue',
    classe: `${BADGE} border-border text-muted-foreground`,
  },
  [STATUT_COMMANDE.ANNULEE]: {
    libelle: 'Annulée',
    classe: `${BADGE} border-destructive/40 bg-destructive/10 text-destructive`,
  },
};

// Statut inconnu (nouvelle valeur côté serveur) : affiché tel quel, sans faire planter le tableau.
export const infosStatut = (statut) => {
  if (STATUTS_COMMANDE[statut]) return STATUTS_COMMANDE[statut];
  // « livree » -> « Livree » : première lettre en capitale, tirets bas en espaces
  const libelle = statut ? statut.charAt(0).toUpperCase() + statut.slice(1).replace(/_/g, ' ') : 'Inconnu';
  return { libelle, classe: `${BADGE} border-border text-muted-foreground` };
};

const pluriel = (nombre, singulier, plurielTexte = `${singulier}s`) =>
  `${nombre} ${nombre > 1 ? plurielTexte : singulier}`;

// Date d'une commande fournisseur : « 28 oct. 2026 » (la valeur brute si elle n'est pas lisible).
export const formaterDateCommande = (valeur) => {
  const date = new Date(valeur);
  return Number.isNaN(date.getTime())
    ? valeur ?? ''
    : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Même table que ApprovisionnementService (côté serveur). 'recue' et 'annulee' sont finaux.
const TRANSITIONS = {
  [STATUT_COMMANDE.EN_ATTENTE]: [STATUT_COMMANDE.EXPEDIEE, STATUT_COMMANDE.ANNULEE],
  [STATUT_COMMANDE.EXPEDIEE]: [STATUT_COMMANDE.RECUE, STATUT_COMMANDE.ANNULEE],
  [STATUT_COMMANDE.RECUE]: [],
  [STATUT_COMMANDE.ANNULEE]: [],
};

export const transitionsPossibles = (statut) => TRANSITIONS[statut] ?? [];

// Bouton qui fait passer une commande à chaque statut atteignable. L'annulation est l'action en retrait.
const ACTIONS_STATUT = {
  [STATUT_COMMANDE.EXPEDIEE]: { libelle: 'Marquer expédiée', retrait: false },
  [STATUT_COMMANDE.RECUE]: { libelle: 'Réceptionner', retrait: false },
  [STATUT_COMMANDE.ANNULEE]: { libelle: 'Annuler la commande', retrait: true },
};

export const actionsStatut = (statut) =>
  transitionsPossibles(statut).map((cible) => ({ statut: cible, ...ACTIONS_STATUT[cible] }));

const decrireCommande = (commande) =>
  `la commande ${commande.fournisseurNom} du ${formaterDateCommande(commande.dateCommande)}`;

// Confirmation demandée avant un statut final (réception, annulation), ou null si le changement est direct.
export const confirmationStatut = (commande, statut) => {
  if (statut === STATUT_COMMANDE.RECUE) {
    const nombre = commande.details?.length ?? 0;
    const articles =
      nombre > 1 ? `Les ${nombre} articles de ${decrireCommande(commande)} seront ajoutés` : `Le contenu de ${decrireCommande(commande)} sera ajouté`;
    return {
      titre: 'Réceptionner la commande ?',
      message: `${articles} au stock. Une commande reçue ne peut plus changer de statut.`,
      libelleConfirmer: 'Réceptionner',
      libelleRefuser: 'Pas encore',
    };
  }
  if (statut === STATUT_COMMANDE.ANNULEE) {
    return {
      titre: 'Annuler la commande ?',
      message: `La commande ${commande.fournisseurNom} du ${formaterDateCommande(commande.dateCommande)} (${formaterPrix(
        commande.montantTotal
      )}) sera annulée. Cette action est irréversible.`,
      libelleConfirmer: 'Annuler la commande',
      libelleRefuser: 'Garder',
      destructif: true,
    };
  }
  return null;
};

export const messageStatutChange = (statut) =>
  ({
    [STATUT_COMMANDE.EXPEDIEE]: 'Commande marquée comme expédiée',
    [STATUT_COMMANDE.RECUE]: 'Commande réceptionnée : le stock a été crédité',
    [STATUT_COMMANDE.ANNULEE]: 'Commande annulée',
  })[statut] ?? 'Statut mis à jour';

// Texte de la confirmation de suppression d'un fournisseur : tout ce qui part avec lui.
export const messageSuppressionFournisseur = (nom, nombreArticles, nombreCommandes) => {
  const perdus = [
    nombreArticles > 0 && pluriel(nombreArticles, 'article de catalogue', 'articles de catalogue'),
    nombreCommandes > 0 && pluriel(nombreCommandes, 'commande'),
  ].filter(Boolean);
  const suite = perdus.length ? ` avec ses ${perdus.join(' et ses ')}` : '';
  return `Le fournisseur « ${nom} » sera supprimé${suite}. Cette action est irréversible.`;
};

// Articles du catalogue avec le stock de leur matière première ({ article, stock }, stock nul s'il est
// inconnu) : ce qui manque le plus en premier, puis par nom.
export const catalogueParUrgence = (catalogue, stocks) => {
  const stocksParId = new Map(stocks.map((stock) => [stock.id, stock]));
  return catalogue
    .map((article) => ({ article, stock: stocksParId.get(article.idStock) ?? null }))
    .sort(
      (a, b) =>
        rangUrgence(a.stock) - rangUrgence(b.stock) ||
        a.article.matierePremiereNom.localeCompare(b.article.matierePremiereNom, 'fr')
    );
};

export const commandesDuFournisseur = (commandes, idFournisseur) =>
  commandes.filter((commande) => String(commande.idFournisseur) === String(idFournisseur));

// Résumé d'un bon en cours, pour la liste des fournisseurs : « Bon en cours : 3 articles, 32,40 € ».
export const resumerBon = (bon) =>
  `Bon en cours : ${pluriel(bon.length, 'article')}, ${formaterPrix(totalBon(bon))}`;

// --- Bon de commande : une ligne est { idStock, nom, quantite, prixUnitaire, uniteMesure, pas } ---
// pas : quantité ajoutée ou retirée par les boutons (1 000 g, 10 tranches...), voir PAS_COMMANDE.

// Arrondi au millième : 0,1 + 0,2 kg doit afficher 0,3 kg
const arrondir = (valeur) => Math.round(valeur * 1000) / 1000;

export const ajouterArticle = (bon, article, uniteMesure) => {
  if (bon.some((ligne) => ligne.idStock === article.idStock)) {
    return incrementer(bon, article.idStock);
  }
  const pas = pasCommande(uniteMesure);
  return [
    ...bon,
    {
      idStock: article.idStock,
      nom: article.matierePremiereNom,
      quantite: pas,
      prixUnitaire: article.prixUnitaire,
      uniteMesure,
      pas,
    },
  ];
};

export const incrementer = (bon, idStock) =>
  bon.map((ligne) =>
    ligne.idStock === idStock ? { ...ligne, quantite: arrondir(ligne.quantite + (ligne.pas ?? 1)) } : ligne
  );

// La ligne disparaît quand sa quantité tombe à zéro.
export const decrementer = (bon, idStock) =>
  bon.flatMap((ligne) => {
    if (ligne.idStock !== idStock) return [ligne];
    const quantite = arrondir(ligne.quantite - (ligne.pas ?? 1));
    return quantite > 0 ? [{ ...ligne, quantite }] : [];
  });

// Saisie libre : décimales acceptées, avec une virgule ou un point (« 2,5 » kg). Une saisie vide,
// nulle ou invalide laisse la quantité inchangée.
export const definirQuantite = (bon, idStock, saisie) => {
  const quantite = arrondir(Number(String(saisie).replace(',', '.').trim()));
  if (!Number.isFinite(quantite) || quantite <= 0) {
    return bon;
  }
  return bon.map((ligne) => (ligne.idStock === idStock ? { ...ligne, quantite } : ligne));
};

export const totalLigne = (ligne) => ligne.quantite * ligne.prixUnitaire;

export const totalBon = (bon) => bon.reduce((total, ligne) => total + totalLigne(ligne), 0);

// Corps de la requête de création d'une commande fournisseur.
export const construirePayload = (idFournisseur, bon) => ({
  idFournisseur: Number(idFournisseur),
  items: bon.map((ligne) => ({
    idStock: ligne.idStock,
    quantite: ligne.quantite,
  })),
});