import api from './axios';

export const getCategories = async () => {
  const response = await api.get('http://localhost:8080/api/categories');
  return response.data;
};

export const getProduits = async () => {
  const response = await api.get('http://localhost:8080/api/produits');
  return response.data;
};