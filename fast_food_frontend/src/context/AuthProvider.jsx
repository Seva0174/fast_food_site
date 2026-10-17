import { createContext, useState } from 'react';
import { loginApi } from '../api/authApi';
import { effacerSession, lireToken, lireUtilisateur, sauvegarderSession } from '../lib/session';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(lireUtilisateur);
  const [token, setToken] = useState(lireToken);

  const login = async (email, mdp) => {
    const data = await loginApi(email, mdp);
    const utilisateur = { id: data.id, email: data.email, nom: data.nom, role: data.role };

    sauvegarderSession(data.token, utilisateur);
    setUser(utilisateur);
    setToken(data.token);

    return data;
  };

  const logout = () => {
    effacerSession();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};