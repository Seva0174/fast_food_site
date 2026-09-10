import axios from './axios';

const API_URL = 'http://localhost:8080/api/auth';

export const loginApi = async (email, mdp) => {
  const response = await axios.post(`${API_URL}/login`, { email, mdp });
  return response.data; // Renvoie AuthResponse (token, id, email, nom, role)
};

export const registerApi = async (nom, email, mdp) => {
  const response = await axios.post(`${API_URL}/register`, { nom, email, mdp });
  return response.data; // Renvoie le message de confirmation
};