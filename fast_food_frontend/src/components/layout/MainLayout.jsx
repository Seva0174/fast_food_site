import { useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ContextePanier } from '../../context/ContextePanier';
import { BandeauMessage } from '../ui/bandeau';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ErreurBoundary } from './ErreurBoundary';

// Pages deja migrees vers le theme sombre. Les autres restent en theme clair
// (classe .theme-clair) tant que leur design n'est pas refait.
// Ajouter ici chaque page au fur et a mesure de sa migration.
const ROUTES_SOMBRES = ['/'];

// Pages qui gerent elles-memes leur largeur (banniere pleine largeur).
const ROUTES_PLEINE_LARGEUR = ['/'];

export const MainLayout = () => {
  const { pathname } = useLocation();
  const { message } = useContext(ContextePanier);

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

      {/* Messages du panier : fixes en bas de l'écran, au-dessus des modales */}
      {message && (
        <div className="fixed bottom-4 left-1/2 z-[70] w-full max-w-md -translate-x-1/2 px-4">
          <BandeauMessage message={message} />
        </div>
      )}
    </div>
  );
};