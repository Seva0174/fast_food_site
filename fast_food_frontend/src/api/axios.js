import axios from 'axios';
import { effacerSession, lireToken } from '../lib/session';

const api = axios.create({
  // VITE_API_URL permet de changer l'adresse de l'API au build (Docker, production)
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = lireToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirige vers /login si le token est expire ou invalide (401 ou 403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const statut = error.response?.status;
    if (statut === 401 || statut === 403) {
      effacerSession();

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;