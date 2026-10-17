// Règles des commandes fournisseurs et du bon de commande (fonctions pures).

export const STATUT_COMMANDE = {
  EN_ATTENTE: 'en_attente',
  EXPEDIEE: 'expediee',
  RECUE: 'recue',
  ANNULEE: 'annulee',
};

// Libellé du badge, libellé dans la liste de choix et classes du badge.
export const STATUTS_COMMANDE = {
  [STATUT_COMMANDE.EN_ATTENTE]: {
    libelleChoix: 'En attente',
    classe: 'bg-amber-100 text-amber-800',
  },
  [STATUT_COMMANDE.EXPEDIEE]: {
    libelleChoix: 'Expédiée',
    classe: 'bg-blue-100 text-blue-800',
  },
  [STATUT_COMMANDE.RECUE]: {
    libelleChoix: 'Reçue (Crédite le stock)',
    classe: 'bg-green-100 text-green-800',
  },
  [STATUT_COMMANDE.ANNULEE]: {
    libelleChoix: 'Annulée',
    classe: 'bg-red-100 text-red-800',
  },
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
    label: STATUTS_COMMANDE[s].libelleChoix,
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