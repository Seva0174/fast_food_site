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