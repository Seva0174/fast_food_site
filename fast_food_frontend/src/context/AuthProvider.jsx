import { createContext, useCallback, useState } from 'react';
import { loginApi } from '../api/authApi';
import { effacerSession, lireToken, lireUtilisateur, sauvegarderSession } from '../lib/session';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(lireUtilisateur);
  const [token, setToken] = useState(lireToken);
  // Deconnexion volontaire : la page protegee qui etait ouverte ne doit pas devenir la destination
  // du compte suivant (voir ProtectedRoute). La page de connexion l'efface en s'ouvrant : une page
  // protegee demandee plus tard redevient une destination.
  const [deconnecte, setDeconnecte] = useState(false);
  const effacerDeconnexion = useCallback(() => setDeconnecte(false), []);

  const login = async (email, mdp) => {
    const data = await loginApi(email, mdp);
    const utilisateur = { id: data.id, email: data.email, nom: data.nom, role: data.role };

    sauvegarderSession(data.token, utilisateur);
    setUser(utilisateur);
    setToken(data.token);
    setDeconnecte(false);

    return data;
  };

  const logout = () => {
    effacerSession();
    setUser(null);
    setToken(null);
    setDeconnecte(true);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, deconnecte, effacerDeconnexion, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};