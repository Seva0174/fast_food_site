// court : affiché à côté d'une quantité (« 12 unités », « 2 500 g »)
export const UNITES = [
  { value: 'unite', label: 'unité(s)', court: 'unité' },
  { value: 'g', label: 'g (grammes)', court: 'g' },
  { value: 'kg', label: 'kg (kilos)', court: 'kg' },
  { value: 'ml', label: 'ml (millilitres)', court: 'ml' },
  { value: 'L', label: 'L (litres)', court: 'L' },
  { value: 'tranche', label: 'tranche(s)', court: 'tranche' },
];

export const UNITE_PAR_DEFAUT = 'unite';

// Quantité à partir de laquelle un stock est signalé comme bas, selon son unité
// (5 unités et 5 grammes ne disent pas la même chose).
export const SEUILS_ALERTE = { unite: 10, g: 1000, kg: 1, ml: 1000, L: 1, tranche: 20 };
const SEUIL_PAR_DEFAUT = 5;

export const seuilAlerte = (uniteMesure) => SEUILS_ALERTE[uniteMesure] ?? SEUIL_PAR_DEFAUT;

// Quantité ajoutée au bon de commande à chaque clic (« Ajouter », +, −), selon l'unité :
// on commande la farine au kilo, pas au gramme.
export const PAS_COMMANDE = { unite: 1, g: 1000, kg: 1, ml: 1000, L: 1, tranche: 10 };

export const pasCommande = (uniteMesure) => PAS_COMMANDE[uniteMesure] ?? 1;

export const ETAT_STOCK = { EPUISE: 'epuise', BAS: 'bas', OK: 'ok' };

export const etatStock = ({ quantite, uniteMesure }) => {
  const valeur = Number(quantite);
  if (valeur <= 0) return ETAT_STOCK.EPUISE;
  if (valeur <= seuilAlerte(uniteMesure)) return ETAT_STOCK.BAS;
  return ETAT_STOCK.OK;
};

export const estEnAlerte = (stock) => etatStock(stock) !== ETAT_STOCK.OK;

export const compterAReapprovisionner = (stocks) => stocks.filter(estEnAlerte).length;

const PRIORITE = { [ETAT_STOCK.EPUISE]: 0, [ETAT_STOCK.BAS]: 1, [ETAT_STOCK.OK]: 2 };

// 0 : épuisé, 1 : bas, 2 : suffisant (ou stock inconnu).
export const rangUrgence = (stock) => (stock ? PRIORITE[etatStock(stock)] : PRIORITE[ETAT_STOCK.OK]);

// Épuisés d'abord, puis bas, puis le reste ; par nom à l'intérieur de chaque groupe.
export const trierParUrgence = (stocks) =>
  [...stocks].sort((a, b) => rangUrgence(a) - rangUrgence(b) || a.nom.localeCompare(b.nom, 'fr'));

// Recherche par nom (sans tenir compte des accents ni de la casse), et filtre « à réapprovisionner ».
const normaliser = (texte) => texte.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export const filtrerStocks = (stocks, { recherche, seulementAlertes }) => {
  const terme = normaliser(recherche.trim());
  return stocks.filter(
    (stock) => (!seulementAlertes || estEnAlerte(stock)) && (!terme || normaliser(stock.nom).includes(terme))
  );
};

// Unité accordée à une quantité : « unités », « g », « tranche » (vide si l'unité manque).
export const libelleUnite = (quantite, uniteMesure) => {
  const unite = UNITES.find((u) => u.value === uniteMesure);
  if (!unite) return uniteMesure ?? '';
  const pluriel = Number(quantite) >= 2 && (uniteMesure === 'unite' || uniteMesure === 'tranche');
  return `${unite.court}${pluriel ? 's' : ''}`;
};

// Quantité avec son unité : « 12 unités », « 2 500 g », « 1 tranche ».
export const formaterQuantite = (quantite, uniteMesure) => {
  const texte = Number(quantite).toLocaleString('fr-FR', { maximumFractionDigits: 3 });
  const unite = libelleUnite(quantite, uniteMesure);
  return unite ? `${texte} ${unite}` : texte;
};

// Les seuils, pour l'aide sous le titre : « 10 unités, 1 kg (1 000 g), 1 L (1 000 ml), 20 tranches ».
export const DESCRIPTION_SEUILS = `${formaterQuantite(SEUILS_ALERTE.unite, 'unite')}, ${formaterQuantite(
  SEUILS_ALERTE.kg,
  'kg'
)} (${formaterQuantite(SEUILS_ALERTE.g, 'g')}), ${formaterQuantite(SEUILS_ALERTE.L, 'L')} (${formaterQuantite(
  SEUILS_ALERTE.ml,
  'ml'
)}), ${formaterQuantite(SEUILS_ALERTE.tranche, 'tranche')}`;

// Renvoie le message d'erreur d'une matière première invalide, ou null si elle est valide.
export const erreurNouveauStock = ({ nom, quantite }) => {
  if (!nom.trim()) return 'Le nom de la matière première est obligatoire';
  if (Number.isNaN(quantite) || quantite < 0) return 'La quantité doit être un nombre positif ou nul';
  return null;
};
