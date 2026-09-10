import axios from './axios';

export const passerCommandeApi = async (adresse) => {
  const payload = {
    cpRue: adresse.cpRue ,//|| adresse.rue,
    cpVille: adresse.cpVille ,// || adresse.ville,
    cpCodePostal: adresse.cpCodePostal //|| adresse.codePostal,
  };

  const response = await axios.post('/commandes', payload);
  return response.data;
};