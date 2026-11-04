const formateur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

// Prix au format français : « 8,90 € ».
export const formaterPrix = (valeur) => formateur.format(Number(valeur ?? 0));

const formateurUnitaire = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 4,
});

// Prix d'achat à l'unité de mesure, qui peut descendre sous le centime : « 0,004 € » (au gramme), « 1,20 € ».
export const formaterPrixUnitaire = (valeur) => formateurUnitaire.format(Number(valeur ?? 0));

// Supplément affiché à côté d'une option : « +1,00 € ».
export const formaterSupplement = (valeur) => `+${formaterPrix(valeur)}`;
