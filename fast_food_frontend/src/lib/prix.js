const formateur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

// Prix au format français : « 8,90 € ».
export const formaterPrix = (valeur) => formateur.format(Number(valeur ?? 0));

// Supplément affiché à côté d'une option : « +1,00 € ».
export const formaterSupplement = (valeur) => `+${formaterPrix(valeur)}`;
