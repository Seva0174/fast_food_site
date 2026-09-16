import api from './axios';

// Récupère le panier de l'utilisateur connecté
export const getPanierApi = async () => {
  const response = await api.get('/panier');
  return response.data;
};

// Ajoute un produit au panier (ou augmente sa quantité s'il y est déjà)
export const ajouterProduitApi = async (produitId, quantite = 1) => {
  const response = await api.post('/panier/items', { id: produitId, quantite });
  return response.data;
};

// Modifie la quantité d'un item du panier
export const modifierQuantiteApi = async (itemId, quantite) => {
  const response = await api.put(`/panier/items/${itemId}`, { quantite });
  return response.data;
};

// Supprime un item du panier
export const supprimerItemApi = async (itemId) => {
  const response = await api.delete(`/panier/items/${itemId}`);
  return response.data;
};

// Vide entièrement le panier
export const viderPanierApi = async () => {
  await api.delete('/panier');
};