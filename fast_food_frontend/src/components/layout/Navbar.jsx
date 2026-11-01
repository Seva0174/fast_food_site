import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, LogOut, Shield, ClipboardList } from 'lucide-react';
import { AuthContext } from '../../context/AuthProvider';
import { ContextePanier } from '../../context/ContextePanier';
import { useRoleUtilisateur } from '../../hooks/useRoleUtilisateur';
import { LienNav } from './LienNav';
import { Badge } from '../ui/badge';
import { Bouton } from '../ui/bouton';
import { NOM_SITE } from '../../lib/site';

// Bouton secondaire : la connexion n'est demandee qu'a la validation du panier,
// l'orange plein reste reserve a l'action de commande.
const classeConnexion =
  'rounded-lg border border-border bg-secondary px-4 py-2 font-semibold text-foreground transition-colors hover:bg-accent';

export const Navbar = () => {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const { logout } = useContext(AuthContext);
  const { totalArticles, nombreAjouts, demanderOuverturePanier } = useContext(ContextePanier);
  const { pathname } = useLocation();
  // Sur la page de connexion elle-meme, le bouton "Connexion" ferait doublon avec le formulaire
  const surPageAuth = pathname === '/login' || pathname === '/register';
  const { user, estStaff, estAdmin } = useRoleUtilisateur();
  const navigate = useNavigate();

  const libelleUtilisateur = user?.nom || user?.email;

  const deconnecter = () => {
    logout();
    setMenuOuvert(false);
    navigate('/login');
  };

  const fermerMenu = () => setMenuOuvert(false);

  // Le panier vit sur la carte : on y retourne puis on l'ouvre (tiroir mobile ou panier lateral)
  const ouvrirPanier = () => {
    setMenuOuvert(false);
    if (pathname !== '/') navigate('/');
    demanderOuverturePanier();
  };

  const badgePanier = totalArticles > 0 && (
    <Badge key={nombreAjouts} className="pulsation-panier ml-1 px-2 py-0.5 tabular-nums">
      {totalArticles}
    </Badge>
  );

  const boutonPanier = (mobile = false) => (
    <button
      type="button"
      onClick={ouvrirPanier}
      className={`flex items-center gap-1.5 font-medium text-foreground/80 transition-colors hover:text-foreground ${
        mobile ? 'min-h-11 w-full' : 'min-h-11'
      }`}
    >
      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
      Panier
      {badgePanier}
    </button>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="titre-marque flex min-h-11 items-center text-3xl text-foreground" aria-label={`${NOM_SITE}, accueil`}>
            Taco<span className="text-primary">Burger</span>
          </Link>

          {/* Navigation bureau */}
          <div className="hidden items-center space-x-6 md:flex">
            <LienNav to="/">Carte</LienNav>

            {boutonPanier()}

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
                  aria-current={pathname === '/user' ? 'page' : undefined}
                  aria-label={`Mon compte (${libelleUtilisateur})`}
                  className={`flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors hover:text-foreground ${
                    pathname === '/user'
                      ? 'text-foreground underline decoration-2 underline-offset-8'
                      : 'text-foreground/80'
                  }`}
                >
                  <User className="h-4 w-4" aria-hidden="true" />
                  <span>{libelleUtilisateur}</span>
                </Link>

                <Bouton
                  variante="fantome"
                  taille="icone"
                  className="lg:size-11"
                  onClick={deconnecter}
                  title="Déconnexion"
                  aria-label="Déconnexion"
                >
                  <LogOut className="h-5 w-5" />
                </Bouton>
              </div>
            ) : (
              !surPageAuth && (
                <Link to="/login" className={classeConnexion}>
                  Connexion
                </Link>
              )
            )}
          </div>

          {/* Bouton menu mobile */}
          <div className="flex items-center gap-1 md:hidden">
            {/* Hors de l'accueil (pas de barre de panier), le panier reste a portee de pouce */}
            {pathname !== '/' && (
              <button
                type="button"
                onClick={ouvrirPanier}
                aria-label={`Panier, ${totalArticles} article${totalArticles > 1 ? 's' : ''}`}
                className="relative flex size-11 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
              >
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                {totalArticles > 0 && (
                  <span className="absolute right-0.5 top-0.5 min-w-5 rounded-full bg-primary px-1 text-center text-xs font-bold tabular-nums text-primary-foreground">
                    {totalArticles}
                  </span>
                )}
              </button>
            )}
            <Bouton
              variante="fantome"
              taille="icone"
              onClick={() => setMenuOuvert((ouvert) => !ouvert)}
              aria-label={menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'}
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

          {boutonPanier(true)}

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
              <Bouton variante="discret" taille="nu" onClick={deconnecter} className="min-h-11 w-full">
                <span className="w-full text-left">Déconnexion</span>
              </Bouton>
            </div>
          ) : (
            !surPageAuth && (
              <Link
                to="/login"
                onClick={fermerMenu}
                className={`mt-2 block text-center ${classeConnexion}`}
              >
                Connexion
              </Link>
            )
          )}
        </div>
      )}
    </nav>
  );
};