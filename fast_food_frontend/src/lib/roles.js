export const ROLE = {
  CLIENT: 'client',
  EMPLOYE: 'employe',
  ADMIN: 'admin',
};

export const ROLES_STAFF = [ROLE.ADMIN, ROLE.EMPLOYE];

export const aUnRole = (user, roles) => roles.includes(user?.role);

export const estStaff = (user) => aUnRole(user, ROLES_STAFF);

export const estAdmin = (user) => user?.role === ROLE.ADMIN;