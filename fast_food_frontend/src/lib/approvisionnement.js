// Règles des commandes fournisseurs et du bon de commande (fonctions pures).

export const STATUT_COMMANDE = {
  EN_ATTENTE: 'en_attente',
  EXPEDIEE: 'expediee',
  RECUE: 'recue',
  ANNULEE: 'annulee',
};

const BADGE = 'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold';

// Libellé du badge, libellé dans la liste de choix et classes du badge (tokens du thème :
// un seul signal fort, le rouge de l'annulation ; les statuts finaux s'effacent).
export const STATUTS_COMMANDE = {
  [STATUT_COMMANDE.EN_ATTENTE]: {
    libelle: 'En attente',
    libelleChoix: 'En attente',
    classe: `${BADGE} border-border bg-secondary text-secondary-foreground`,
  },
  [STATUT_COMMANDE.EXPEDIEE]: {
    libelle: 'Expédiée',
    libelleChoix: 'Expédiée',
    classe: `${BADGE} border-foreground/40 text-foreground`,
  },
  [STATUT_COMMANDE.RECUE]: {
    libelle: 'Reçue',
    libelleChoix: 'Reçue (crédite le stock)',
    classe: `${BADGE} border-border text-muted-foreground`,
  },
  [STATUT_COMMANDE.ANNULEE]: {
    libelle: 'Annulée',
    libelleChoix: 'Annulée',
    classe: `${BADGE} border-destructive/40 bg-destructive/10 text-destructive`,
  },
};

// Statut inconnu (nouvelle valeur côté serveur) : affiché tel quel, sans faire planter le tableau.
export const infosStatut = (statut) => {
  if (STATUTS_COMMANDE[statut]) return STATUTS_COMMANDE[statut];
  // « livree » -> « Livree » : première lettre en capitale, tirets bas en espaces
  const libelle = statut ? statut.charAt(0).toUpperCase() + statut.slice(1).replace(/_/g, ' ') : 'Inconnu';
  return { libelle, libelleChoix: libelle, classe: `${BADGE} border-border text-muted-foreground` };
};

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

// Choix proposés pour une commande : son statut actuel (affiché) puis les statuts atteignables.
export const optionsStatut = (statut) =>
  [statut, ...transitionsPossibles(statut)].map((s) => ({
    value: s,
    label: infosStatut(s).libelleChoix,
  }));

// --- Bon de commande : une ligne est { idStock, nom, quantite, prixUnitaire } ---

export const ajouterArticle = (bon, article) => {
  if (bon.some((ligne) => ligne.idStock === article.idStock)) {
    return incrementer(bon, article.idStock);
  }
  return [
    ...bon,
    {
      idStock: article.idStock,
      nom: article.matierePremiereNom,
      quantite: 1,
      prixUnitaire: article.prixUnitaire,
    },
  ];
};

export const incrementer = (bon, idStock) =>
  bon.map((ligne) => (ligne.idStock === idStock ? { ...ligne, quantite: ligne.quantite + 1 } : ligne));

// La ligne disparaît quand sa quantité tombe à zéro.
export const decrementer = (bon, idStock) =>
  bon.flatMap((ligne) => {
    if (ligne.idStock !== idStock) return [ligne];
    return ligne.quantite > 1 ? [{ ...ligne, quantite: ligne.quantite - 1 }] : [];
  });

  
export const definirQuantite = (bon, idStock, saisie) => {
  const quantite = parseInt(saisie, 10);
  if (Number.isNaN(quantite) || quantite <= 0) {
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