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