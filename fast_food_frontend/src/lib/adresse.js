// Adresse de livraison telle qu'attendue par l'API de commande.
export const ADRESSE_VIDE = { cpRue: '', cpVille: '', cpCodePostal: '' };

// Lit l'adresse par defaut enregistree dans la page compte ({ rue, ville, codePostal }).
// Renvoie null s'il n'y en a pas ou si elle est illisible.
export const lireAdresseEnregistree = (idUser) => {
  const brut = localStorage.getItem(`adresse_user_${idUser}`);
  if (!brut) return null;

  try {
    return JSON.parse(brut);
  } catch (erreur) {
    console.error("Erreur de lecture de l'adresse enregistree :", erreur);
    return null;
  }
};

// Convertit l'adresse de la page compte vers le format de la commande.
export const adresseVersCommande = ({ rue, ville, codePostal }) => ({
  cpRue: rue ?? '',
  cpVille: ville ?? '',
  cpCodePostal: codePostal ?? '',
});

// Enregistre l'adresse par defaut du compte ({ rue, ville, codePostal }).
export const enregistrerAdresse = (idUser, { rue, ville, codePostal }) =>
  localStorage.setItem(`adresse_user_${idUser}`, JSON.stringify({ rue, ville, codePostal }));
// Verifie une adresse de livraison ({ cpRue, cpVille, cpCodePostal }).
// Renvoie un objet { champ: message } ; vide si l'adresse est complete.
export const verifierAdresse = ({ cpRue, cpVille, cpCodePostal }) => {
  const erreurs = {};
  if (!cpRue.trim()) erreurs.cpRue = 'Indiquez le numéro et le nom de la rue.';
  if (!cpCodePostal.trim()) erreurs.cpCodePostal = 'Indiquez le code postal.';
  else if (!/^\d{5}$/.test(cpCodePostal.trim()))
    erreurs.cpCodePostal = 'Le code postal compte 5 chiffres.';
  if (!cpVille.trim()) erreurs.cpVille = 'Indiquez la ville.';
  return erreurs;
};

// Ordre des champs dans le formulaire : le focus va au premier champ en erreur.
export const CHAMPS_ADRESSE = ['cpRue', 'cpCodePostal', 'cpVille'];
