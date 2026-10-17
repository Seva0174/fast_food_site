import api from './axios';

const BASE = '/admin/employes';

// Ces fonctions renvoient directement les données de la réponse.

// --- Employés ---
export const getEmployesApi = async () => (await api.get(BASE)).data;

export const creerEmployeApi = async (donnees) => (await api.post(BASE, donnees)).data;

export const modifierEmployeApi = async (id, donnees) => (await api.put(`${BASE}/${id}`, donnees)).data;

export const supprimerEmployeApi = async (id) => {
  await api.delete(`${BASE}/${id}`);
};

// --- Heures ---
export const getHeuresApi = async (idEmploye) => (await api.get(`${BASE}/${idEmploye}/heures`)).data;

export const getHeuresPeriodeApi = async (idEmploye, debut, fin) =>
  (await api.get(`${BASE}/${idEmploye}/heures/periode`, { params: { debut, fin } })).data;

export const ajouterHeuresApi = async (donnees) => (await api.post(`${BASE}/heures`, donnees)).data;

export const supprimerHeureApi = async (idHeure) => {
  await api.delete(`${BASE}/heures/${idHeure}`);
};

// --- Salaire ---
export const getSalaireMensuelApi = async (idEmploye, annee, mois) =>
  (await api.get(`${BASE}/${idEmploye}/salaire`, { params: { annee, mois } })).data;