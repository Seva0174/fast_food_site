import { createContext, useState} from 'react';
import { loginApi } from '../api/authApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('fastfood_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const login = async (email, mdp) => {
    const data = await loginApi(email, mdp);
    
    const userData = {
      id: data.id,
      email: data.email,
      nom: data.nom,
      role: data.role
    };

    setUser(userData);
    setToken(data.token);

    localStorage.setItem('fastfood_user', JSON.stringify(userData));
    localStorage.setItem('token', data.token);

    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fastfood_user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};