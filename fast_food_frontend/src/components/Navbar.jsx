import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';
import { ContextePanier } from '../context/ContextePanier';
import { Menu, X, ShoppingBag, User, LogOut, Shield } from 'lucide-react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const { totalArticles } = useContext(ContextePanier);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          <Link to="/" className="text-xl font-bold text-red-600 flex items-center gap-2">
            FastFood
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-red-600 font-medium">Carte</Link>
            
            <Link to="/commander" className="text-gray-700 hover:text-red-600 flex items-center gap-1 font-medium relative">
              <ShoppingBag className="w-5 h-5" />
              <span>Commander</span>
              {totalArticles > 0 && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                  {totalArticles}
                </span>
              )}
            </Link>

            {user?.role && ['admin', 'employe'].includes(user.role) && (
              <Link to="/admin" className="text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <User className="w-4 h-4" /> {user.nom || user.email}
                </span>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"
                  title="Déconnexion"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition"
              >
                Connexion
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-600 hover:text-black focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-4 space-y-3">
          <Link 
            to="/" 
            onClick={() => setIsOpen(false)}
            className="block text-gray-700 font-medium py-2"
          >
            Carte
          </Link>
          <Link 
            to="/commander" 
            onClick={() => setIsOpen(false)}
            className="block text-gray-700 font-medium py-2"
          >
            Commander
          </Link>

          {user?.role && ['admin', 'employe'].includes(user.role) && (
            <Link 
              to="/admin" 
              onClick={() => setIsOpen(false)}
              className="block text-purple-600 font-medium py-2"
            >
              Panel Admin
            </Link>
          )}

          {user ? (
            <button 
              onClick={() => { handleLogout(); setIsOpen(false); }}
              className="w-full text-left text-red-600 font-medium py-2 border-t border-gray-100"
            >
              Déconnexion ({user.email})
            </button>
          ) : (
            <Link 
              to="/login" 
              onClick={() => setIsOpen(false)}
              className="block text-center bg-red-600 text-white font-medium py-2 rounded-lg mt-2"
            >
              Connexion
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};