import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, LogOut, Shield, ClipboardList } from 'lucide-react';
import { AuthContext } from '../../context/AuthProvider';
import { ContextePanier } from '../../context/ContextePanier';
import { useRoleUtilisateur } from '../../hooks/useRoleUtilisateur';
import { LienNav } from './LienNav';
import { Badge } from '../ui/badge';
import { Bouton } from '../ui/bouton';

const classeConnexion =
  'rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground transition-colors hover:bg-primary/90';

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
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="titre-marque text-3xl text-foreground">
            Fast<span className="text-primary">Food</span>
          </Link>

          {/* Navigation bureau */}
          <div className="hidden items-center space-x-6 md:flex">
            <LienNav to="/">Carte</LienNav>

            <LienNav to="/commander" icone={ShoppingBag}>
              Panier
              {badgePanier}
            </LienNav>

            {estStaff && (
              <LienNav to="/commandes" icone={ClipboardList}>
                Commandes
              </LienNav>
            )}

            {estAdmin && (
              <LienNav to="/admin" icone={Shield}>
                Admin
              </LienNav>
            )}

            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/user"
                  title="Mon compte"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                >
                  <User className="h-4 w-4 text-primary" />
                  <span>{libelleUtilisateur}</span>
                </Link>

                <Bouton variante="fantome" taille="icone" onClick={deconnecter} title="Déconnexion">
                  <LogOut className="h-5 w-5" />
                </Bouton>
              </div>
            ) : (
              <Link to="/login" className={classeConnexion}>
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
              aria-expanded={menuOuvert}
            >
              {menuOuvert ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Bouton>
          </div>
        </div>
      </div>

      {/* Navigation mobile */}
      {menuOuvert && (
        <div className="space-y-1 border-t border-border bg-background px-4 pb-4 pt-2 md:hidden">
          <LienNav to="/" mobile onClick={fermerMenu}>
            Carte
          </LienNav>

          <LienNav to="/commander" mobile onClick={fermerMenu} icone={ShoppingBag}>
            Panier
            {badgePanier}
          </LienNav>

          {estStaff && (
            <LienNav to="/commandes" mobile onClick={fermerMenu} icone={ClipboardList}>
              Commandes
            </LienNav>
          )}

          {estAdmin && (
            <LienNav to="/admin" mobile onClick={fermerMenu} icone={Shield}>
              Admin
            </LienNav>
          )}

          {user && (
            <LienNav to="/user" mobile onClick={fermerMenu} icone={User}>
              Mon compte ({libelleUtilisateur})
            </LienNav>
          )}

          {user ? (
            <div className="border-t border-border pt-1">
              <Bouton variante="discret" taille="nu" onClick={deconnecter} className="w-full py-2">
                <span className="w-full text-left">Déconnexion</span>
              </Bouton>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={fermerMenu}
              className={`mt-2 block text-center ${classeConnexion}`}
            >
              Connexion
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};