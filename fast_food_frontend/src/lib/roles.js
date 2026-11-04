export const ROLE = {
  CLIENT: 'client',
  EMPLOYE: 'employe',
  ADMIN: 'admin',
};

export const ROLES_STAFF = [ROLE.ADMIN, ROLE.EMPLOYE];

export const aUnRole = (user, roles) => roles.includes(user?.role);

export const estStaff = (user) => aUnRole(user, ROLES_STAFF);

export const estAdmin = (user) => user?.role === ROLE.ADMIN;

// Pages reservees a certains roles (memes regles que les ProtectedRoute de App.jsx).
const ROLES_PAR_PAGE = { '/admin': [ROLE.ADMIN], '/commandes': ROLES_STAFF };

// Page ouverte apres la connexion : la page demandee si ce compte y a acces, sinon son espace
// (administration, gestion des commandes ou carte).
export const destinationApresConnexion = (user, depuis) => {
  const roles = ROLES_PAR_PAGE[depuis];
  if (depuis && (!roles || aUnRole(user, roles))) return depuis;
  if (estAdmin(user)) return '/admin';
  if (estStaff(user)) return '/commandes';
  return '/';
};