import { useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ContextePanier } from '../../context/ContextePanier';
import { BandeauMessage } from '../ui/bandeau';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ErreurBoundary } from './ErreurBoundary';

export const MainLayout = () => {
  const { pathname } = useLocation();
  const { message } = useContext(ContextePanier);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <ErreurBoundary key={pathname} >
            <Outlet />
          </ErreurBoundary>
        </main>
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