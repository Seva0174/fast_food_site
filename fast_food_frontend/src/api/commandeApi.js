import api from './axios';

export const passerCommandeApi = async (typeRetrait, adresse) => {
  const payload = {
    typeRetrait,
    cpRue: typeRetrait === 'livraison' ? adresse.cpRue : null,
    cpVille: typeRetrait === 'livraison' ? adresse.cpVille : null,
    cpCodePostal: typeRetrait === 'livraison' ? adresse.cpCodePostal : null,
  };

  const response = await api.post('/commandes', payload);
  return response.data;
};

// Récupérer toutes les commandes (Réservé admin / employé)
export const getAllCommandesApi = async () => {
  const response = await api.get('/commandes/admin/toutes');
  return response.data;
};

// Changer le statut d'une commande (Réservé admin / employé)
export const changerStatusCommandeApi = async (commandeId, status) => {
  const response = await api.patch(`/commandes/admin/${commandeId}/status`, { status });
  return response.data;
};