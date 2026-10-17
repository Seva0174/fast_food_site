import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthProvider';
import { aUnRole } from '../../lib/roles';

export const ProtectedRoute = ({ rolesAutorises }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" replace />;

  if (rolesAutorises && !aUnRole(user, rolesAutorises)) return <Navigate to="/" replace />;

  return <Outlet />;
};