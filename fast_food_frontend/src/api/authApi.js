import api from './axios';

export const loginApi = async (email, mdp) => {
  const response = await api.post('/auth/login', { email, mdp });
  return response.data; // AuthResponse : token, id, email, nom, role
};

export const registerApi = async (nom, email, mdp) => {
  const response = await api.post('/auth/register', { nom, email, mdp });
  return response.data; // Message de confirmation
};