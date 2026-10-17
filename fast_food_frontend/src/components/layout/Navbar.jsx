import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, LogOut, Shield, ClipboardList } from 'lucide-react';
import { AuthContext } from '../../context/AuthProvider';
import { ContextePanier } from '../../context/ContextePanier';
import { useRoleUtilisateur } from '../../hooks/useRoleUtilisateur';
import { LienNav } from './LienNav';
import { Badge } from '../ui/badge';
import { Bouton } from '../ui/bouton';

const couleurStaff = 'text-blue-600 hover:text-blue-800';
const couleurAdmin = 'text-purple-600 hover:text-purple-800';

export const Navbar = () => {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const { logout } = useContext(AuthContext);
  const { totalArticles } = useContext(ContextePanier);
  const { user, estStaff, estAdmin } = useRoleUtilisateur();
  const navigate = useNavigate();

  const libelleUtilisateur = user?.nom || user?.email;

  const deconnecter = () => {
    logout();
    setMenuOuvert(false);
    navigate('/login');
  };

  const fermerMenu = () => setMenuOuvert(false);

  const badgePanier = totalArticles > 0 && (
    <Badge className="ml-1 px-2 py-0.5">{totalArticles}</Badge>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-red-600">
            FastFood
          </Link>

          {/* Navigation bureau */}
          <div className="hidden items-center space-x-6 md:flex">
            <LienNav to="/">Carte</LienNav>

            <LienNav to="/commander" icone={ShoppingBag}>
              Commander
              {badgePanier}
            </LienNav>

            {estStaff && (
              <LienNav to="/commandes" icone={ClipboardList} couleur={couleurStaff}>
                Commandes
              </LienNav>
            )}

            {estAdmin && (
              <LienNav to="/admin" icone={Shield} couleur={couleurAdmin}>
                Admin
              </LienNav>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/user"
                  title="Mon compte"
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-red-600"
                >
                  <User className="h-4 w-4 text-red-600" />
                  <span>{libelleUtilisateur}</span>
                </Link>

                <Bouton variante="fantome" taille="icone" onClick={deconnecter} title="Déconnexion">
                  <LogOut className="h-5 w-5" />
                </Bouton>
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
              >
                Connexion
              </Link>
            )}
          </div>

          {/* Bouton menu mobile */}
          <div className="flex items-center md:hidden">
            <Bouton
              variante="fantome"
              taille="icone"
              onClick={() => setMenuOuvert((ouvert) => !ouvert)}
              aria-label="Ouvrir le menu"
            >
              {menuOuvert ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Bouton>
          </div>
        </div>
      </div>

      {/* Navigation mobile */}
      {menuOuvert && (
        <div className="space-y-3 border-t border-gray-100 bg-white px-4 pb-4 pt-2 md:hidden">
          <LienNav to="/" mobile onClick={fermerMenu}>
            Carte
          </LienNav>

          <LienNav to="/commander" mobile onClick={fermerMenu} icone={ShoppingBag}>
            Commander
            {badgePanier}
          </LienNav>

          {estStaff && (
            <LienNav to="/commandes" mobile onClick={fermerMenu} icone={ClipboardList} couleur={couleurStaff}>
              Commandes
            </LienNav>
          )}

          {user && (
            <LienNav to="/user" mobile onClick={fermerMenu} couleur="text-red-600">
              Mon compte ({libelleUtilisateur})
            </LienNav>
          )}

          {estAdmin && (
            <LienNav to="/admin" mobile onClick={fermerMenu} icone={Shield} couleur={couleurAdmin}>
              Admin
            </LienNav>
          )}

          {user ? (
            <div className="border-t border-gray-100">
              <Bouton variante="lien" taille="nu" onClick={deconnecter} className="w-full py-2">
                <span className="w-full text-left">Déconnexion</span>
              </Bouton>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={fermerMenu}
              className="mt-2 block rounded-lg bg-red-600 py-2 text-center font-medium text-white"
            >
              Connexion
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};