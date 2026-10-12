import { Outlet } from 'react-router-dom';
import { Navbar } from './layout/Navbar';
import { Footer } from './Footer';
import { ErreurBoundary } from './ErrorBoundary';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <ErreurBoundary>
            <Outlet />
          </ErreurBoundary>
        </main>
        <Footer />
    </div>
  );
};