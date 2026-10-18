import api from './axios';

const BASE = '/admin/formules';

// Ces fonctions renvoient directement les données de la réponse.

// --- Emplacements d'un menu ---
export const getGroupesFormuleApi = async (idFormule) => (await api.get(`${BASE}/${idFormule}/groupes`)).data;

export const creerGroupeFormuleApi = async (idFormule, donnees) =>
  (await api.post(`${BASE}/${idFormule}/groupes`, donnees)).data;

export const modifierGroupeFormuleApi = async (idGroupe, donnees) =>
  (await api.put(`${BASE}/groupes/${idGroupe}`, donnees)).data;

export const supprimerGroupeFormuleApi = async (idGroupe) => {
  await api.delete(`${BASE}/groupes/${idGroupe}`);
};

// --- Produits proposés dans un emplacement ---
export const ajouterProduitFormuleApi = async (idGroupe, donnees) =>
  (await api.post(`${BASE}/groupes/${idGroupe}/produits`, donnees)).data;

export const modifierSurcoutFormuleApi = async (idLien, donnees) =>
  (await api.put(`${BASE}/produits/${idLien}`, donnees)).data;

export const retirerProduitFormuleApi = async (idLien) => (await api.delete(`${BASE}/produits/${idLien}`)).data;