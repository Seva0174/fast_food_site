import { useContext, useLayoutEffect } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { ContextePanier } from '../../context/ContextePanier';
import { BandeauMessage } from '../ui/bandeau';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ErreurBoundary } from './ErreurBoundary';

// Pages deja migrees vers le theme sombre. Les autres restent en theme clair
// (classe .theme-clair) tant que leur design n'est pas refait.
// Ajouter ici chaque page au fur et a mesure de sa migration.
const ROUTES_SOMBRES = ['/', '/login', '/register', '/commander', '/user', '/mentions-legales', '/commandes'];

// Pages qui gerent elles-memes leur largeur (banniere pleine largeur).
const ROUTES_PLEINE_LARGEUR = ['/'];

export const MainLayout = () => {
  const { pathname } = useLocation();
  const typeNavigation = useNavigationType();
  const { message } = useContext(ContextePanier);

  // Nouvelle page : on repart du haut (sinon la position de defilement de la page precedente
  // est conservee). "Retour" du navigateur (POP) garde sa position. useLayoutEffect passe
  // avant les effets des pages, qui peuvent ensuite defiler vers un element precis
  // (ex : la carte depuis "Panier", la commande suivie sur /user).
  useLayoutEffect(() => {
    if (typeNavigation !== 'POP') window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, typeNavigation]);

  const themeSombre = ROUTES_SOMBRES.includes(pathname);
  const pleineLargeur = ROUTES_PLEINE_LARGEUR.includes(pathname);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <div
        className={`flex-grow ${themeSombre ? '' : 'theme-clair bg-background text-foreground'}`}
      >
        <main
          className={pleineLargeur ? 'w-full' : 'mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8'}
        >
          <ErreurBoundary key={pathname}>
            <Outlet />
          </ErreurBoundary>
        </main>
      </div>

      <Footer />

      {/* Messages du panier : en bas de l'ecran, au-dessus de la barre du panier mobile
          (bottom-24) et des modales ; le haut est occupe par la navbar et les categories */}
      {message && (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-[70] w-full max-w-md -translate-x-1/2 px-4 lg:bottom-6">
          <BandeauMessage
            message={message}
            className="shadow-xl shadow-black/40 animate-in fade-in slide-in-from-bottom-2 duration-200"
          />
        </div>
      )}
    </div>
  );
};