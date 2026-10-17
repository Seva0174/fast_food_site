import api from './axios';

const BASE = '/options';

// Ces fonctions renvoient directement les données de la réponse.

// --- Groupes d'options ---
export const getGroupesOptionsApi = async (idProduit) => (await api.get(`${BASE}/produit/${idProduit}`)).data;

export const creerGroupeOptionApi = async (idProduit, donnees) =>
  (await api.post(`${BASE}/produit/${idProduit}`, donnees)).data;

export const modifierGroupeOptionApi = async (idGroupe, donnees) =>
  (await api.put(`${BASE}/groupes/${idGroupe}`, donnees)).data;

export const supprimerGroupeOptionApi = async (idGroupe) => {
  await api.delete(`${BASE}/groupes/${idGroupe}`);
};

// --- Options d'un groupe ---
export const creerOptionApi = async (idGroupe, donnees) =>
  (await api.post(`${BASE}/groupes/${idGroupe}/items`, donnees)).data;

export const modifierOptionApi = async (idOption, donnees) =>
  (await api.put(`${BASE}/items/${idOption}`, donnees)).data;

export const supprimerOptionApi = async (idOption) => {
  await api.delete(`${BASE}/items/${idOption}`);
};