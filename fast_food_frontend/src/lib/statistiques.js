// Resultat = chiffre d'affaires - depenses d'approvisionnement - masse salariale.
export const resultatNet = (stats) =>
  Number(stats.chiffreAffairesTotal ?? 0) -
  Number(stats.depensesApprovisionnement ?? 0) -
  Number(stats.masseSalariale ?? 0);

// Chiffres de second plan, affiches sous le chiffre d'affaires et le resultat.
// montant : false pour un simple nombre (pas d'euro).
export const CHIFFRES_SECONDAIRES = [
  { cle: 'nombreCommandesTotal', libelle: 'Commandes valides', montant: false },
  { cle: 'panierMoyen', libelle: 'Panier moyen', montant: true },
  { cle: 'depensesApprovisionnement', libelle: "Dépenses d'approvisionnement", montant: true },
  { cle: 'masseSalariale', libelle: 'Masse salariale', montant: true },
];

// Evolution en % par rapport a la periode precedente, ou null si elle n'a rien a comparer.
export const variationPourcent = (actuel, precedent) => {
  const base = Number(precedent ?? 0);
  if (base === 0) return null;
  return Math.round(((Number(actuel ?? 0) - base) / Math.abs(base)) * 100);
};

export const libelleNombreCommandes = (nombre) => `${nombre} commande${nombre > 1 ? 's' : ''}`;

// Jour le plus charge, ou null s'il n'y a eu aucune commande.
export const jourLePlusCharge = (commandesParJour) => {
  const meilleur = commandesParJour.reduce(
    (max, jour) => (!max || jour.nombreCommandes > max.nombreCommandes ? jour : max),
    null
  );
  return meilleur && meilleur.nombreCommandes > 0 ? meilleur : null;
};

// Jours de la semaine sans aucune commande (la barre à 0 n'a pas de hauteur à lire).
export const joursSansCommande = (commandesParJour) =>
  commandesParJour.filter((jour) => jour.nombreCommandes === 0).map((jour) => jour.jour);

// Description du graphique pour les lecteurs d'ecran : "Lundi 0, Mardi 48, ..."
export const descriptionCommandesParJour = (commandesParJour) =>
  commandesParJour.map((jour) => `${jour.jour} ${jour.nombreCommandes}`).join(', ');

// Paramètres de requête d'une période ; objet vide pour la vue globale.
export const paramsPeriode = (periode) => (periode ? { debut: periode.debut, fin: periode.fin } : {});
