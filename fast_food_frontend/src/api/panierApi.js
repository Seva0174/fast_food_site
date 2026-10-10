import api from './axios';

// Récupère le panier de l'utilisateur connecté
export const getPanierApi = async () => {
  const response = await api.get('/panier');
  return response.data;
};

/**
 * Ajoute un produit au panier.
 * choixFormule : produits choisis dans un menu, au format
 * [{ idGroupe, idProduit, optionIds }]. Les autres champs éventuels (noms, suppléments)
 * servent uniquement à l'affichage du panier invité et ne sont pas envoyés au serveur.
 */
export const ajouterProduitApi = async (
  produit,
  quantite = 1,
  optionItemIds = [],
  choixFormule = []
) => {
  const produitId = typeof produit === 'object' && produit !== null
    ? (produit.produitId || produit.id) 
    : produit;

  const choix = (choixFormule || []).map(({ idGroupe, idProduit, optionIds }) => ({
    idGroupe,
    idProduit,
    optionIds: optionIds || [],
  }));

  const response = await api.post('/panier/items', { 
    produitId: produitId, 
    quantite: quantite,
    optionIds: optionItemIds,
    choixFormule: choix
  });
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