import { useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { estAdmin, estStaff } from '../lib/roles';

// Centralise la lecture du role de l'utilisateur connecte.
export const useRoleUtilisateur = () => {
  const { user } = useContext(AuthContext);

  return { user, estStaff: estStaff(user), estAdmin: estAdmin(user) };
};