import api from './axios';

const BASE = '/produits';

// Ces fonctions renvoient directement les données de la réponse.
// La lecture des produits et des catégories est dans menuApi.js.
export const creerProduitApi = async (donnees) => (await api.post(BASE, donnees)).data;

export const modifierProduitApi = async (id, donnees) => (await api.put(`${BASE}/${id}`, donnees)).data;

export const changerDisponibiliteApi = async (id) => (await api.patch(`${BASE}/${id}/disponibilite`)).data;

export const supprimerProduitApi = async (id) => {
  await api.delete(`${BASE}/${id}`);
};