import api from './axios';

const BASE = '/admin/approvisionnement/matieres-premieres';

// Ces fonctions renvoient directement les données de la réponse.
export const getMatieresPremieresApi = async () => (await api.get(BASE)).data;

export const creerMatierePremiereApi = async (donnees) => (await api.post(BASE, donnees)).data;

export const modifierStockApi = async (id, donnees) => (await api.put(`${BASE}/${id}`, donnees)).data;

export const supprimerMatierePremiereApi = async (id) => {
  await api.delete(`${BASE}/${id}`);
};