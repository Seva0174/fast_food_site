import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthProvider';
import { ROLE, aUnRole, estStaff } from '../../lib/roles';
import { PageArret } from './PageArret';

export const ProtectedRoute = ({ rolesAutorises }) => {
  const { user, deconnecte } = useContext(AuthContext);
  const location = useLocation();

  // La page demandee est transmise a /login pour y revenir apres la connexion (pas apres une deconnexion :
  // le compte suivant irait sur la page du precedent)
  if (!user) return <Navigate to="/login" replace state={deconnecte ? undefined : { depuis: location.pathname }} />;

  // Connecte sans le bon role : on le dit, plutot que de renvoyer en silence vers l'accueil
  if (rolesAutorises && !aUnRole(user, rolesAutorises)) {
    const reserveAdmin = rolesAutorises.length === 1 && rolesAutorises[0] === ROLE.ADMIN;
    return (
      <PageArret
        titre="Accès réservé"
        texte={
          reserveAdmin
            ? "Cette page est réservée à l'administration du restaurant : ton compte n'y a pas accès."
            : "Cette page est réservée à l'équipe du restaurant : ton compte n'y a pas accès."
        }
        lien={estStaff(user) ? { to: '/commandes', libelle: 'Gestion des commandes' } : { to: '/', libelle: 'Voir la carte' }}
      />
    );
  }

  return <Outlet />;
};
