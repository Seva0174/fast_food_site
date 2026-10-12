import { useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';

// Centralise la lecture du rôle de l'utilisateur connecté.
export const useRoleUtilisateur = () => {
  const { user } = useContext(AuthContext);
  const role = user?.role?.toLowerCase().replace('role_', '');

  return {
    user,
    estStaff: ['admin', 'employe'].includes(role),
    estAdmin: role === 'admin',
  };
};