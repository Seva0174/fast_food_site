export const CARTES_STATISTIQUES = [
  {
    cle: 'chiffreAffairesTotal',
    libelle: "Chiffre d'Affaires",
    suffixe: ' €',
    classes: { fond: 'border-blue-200 bg-blue-50', libelle: 'text-blue-600', valeur: 'text-blue-900' },
  },
  {
    cle: 'panierMoyen',
    libelle: 'Panier Moyen',
    suffixe: ' €',
    classes: { fond: 'border-amber-200 bg-amber-50', libelle: 'text-amber-600', valeur: 'text-amber-900' },
  },
  {
    cle: 'depensesApprovisionnement',
    libelle: 'Dépenses Approvisionnement',
    suffixe: ' €',
    classes: { fond: 'border-red-200 bg-red-50', libelle: 'text-red-600', valeur: 'text-red-900' },
  },
  {
    cle: 'masseSalariale',
    libelle: 'Masse Salariale',
    suffixe: ' €',
    classes: { fond: 'border-green-200 bg-green-50', libelle: 'text-green-600', valeur: 'text-green-900' },
  },
  {
    cle: 'nombreCommandesTotal',
    libelle: 'Commandes Valides',
    suffixe: '',
    classes: { fond: 'border-purple-200 bg-purple-50', libelle: 'text-purple-600', valeur: 'text-purple-900' },
  },
];

// Paramètres de requête d'une période ; objet vide pour la vue globale.
export const paramsPeriode = (periode) => (periode ? { debut: periode.debut, fin: periode.fin } : {});