// Session de l'utilisateur : le jeton JWT et les informations du compte sont gardes dans le navigateur.
const CLE_TOKEN = 'token';
const CLE_UTILISATEUR = 'fastfood_user';

export const lireToken = () => localStorage.getItem(CLE_TOKEN) || null;

// Renvoie l'utilisateur enregistre, ou null s'il n'y en a pas ou si l'enregistrement est illisible.
export const lireUtilisateur = () => {
  try {
    const brut = localStorage.getItem(CLE_UTILISATEUR);
    return brut ? JSON.parse(brut) : null;
  } catch {
    localStorage.removeItem(CLE_UTILISATEUR);
    return null;
  }
};

export const sauvegarderSession = (token, utilisateur) => {
  localStorage.setItem(CLE_TOKEN, token);
  localStorage.setItem(CLE_UTILISATEUR, JSON.stringify(utilisateur));
};

export const effacerSession = () => {
  localStorage.removeItem(CLE_TOKEN);
  localStorage.removeItem(CLE_UTILISATEUR);
};