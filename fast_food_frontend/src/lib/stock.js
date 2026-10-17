export const UNITES = [
  { value: 'unite', label: 'unité(s)' },
  { value: 'g', label: 'g (grammes)' },
  { value: 'kg', label: 'kg (kilos)' },
  { value: 'ml', label: 'ml (millilitres)' },
  { value: 'L', label: 'L (litres)' },
  { value: 'tranche', label: 'tranche(s)' },
];

export const UNITE_PAR_DEFAUT = 'unite';

// Quantité à partir de laquelle un stock est signalé comme bas (toutes unités confondues).
export const SEUIL_ALERTE = 5;

export const estEnAlerte = (stock) => Number(stock.quantite) <= SEUIL_ALERTE;

export const formaterQuantite = (quantite) => Number(quantite).toLocaleString('fr-FR');

// Renvoie le message d'erreur d'une matière première invalide, ou null si elle est valide.
export const erreurNouveauStock = ({ nom }) =>
  nom.trim() ? null : 'Le nom de la matière première est obligatoire';