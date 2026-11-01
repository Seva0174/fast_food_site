import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthProvider';
import { aUnRole } from '../../lib/roles';

export const ProtectedRoute = ({ rolesAutorises }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // La page demandee est transmise a /login pour y revenir apres la connexion
  if (!user) return <Navigate to="/login" replace state={{ depuis: location.pathname }} />;

  if (rolesAutorises && !aUnRole(user, rolesAutorises)) return <Navigate to="/" replace />;

  return <Outlet />;
};
