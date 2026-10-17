import api from './axios';

const BASE = '/admin/approvisionnement';

// Ces fonctions renvoient directement les données de la réponse.

// --- Fournisseurs et catalogue ---
export const getFournisseursApi = async () => (await api.get(`${BASE}/fournisseurs`)).data;

export const creerFournisseurApi = async (donnees) => (await api.post(`${BASE}/fournisseurs`, donnees)).data;

export const supprimerFournisseurApi = async (id) => {
  await api.delete(`${BASE}/fournisseurs/${id}`);
};

export const getCatalogueApi = async (idFournisseur) =>
  (await api.get(`${BASE}/fournisseurs/${idFournisseur}/catalogue`)).data;

export const importerCatalogueCsvApi = async (idFournisseur, fichier) => {
  const formData = new FormData();
  formData.append('file', fichier);
  const reponse = await api.post(`${BASE}/fournisseurs/${idFournisseur}/catalogue/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return reponse.data;
};

// --- Commandes fournisseurs ---
export const getCommandesFournisseursApi = async () => (await api.get(`${BASE}/commandes`)).data;

export const creerCommandeFournisseurApi = async (donnees) => (await api.post(`${BASE}/commandes`, donnees)).data;

export const changerStatutCommandeFournisseurApi = async (id, status) =>
  (await api.patch(`${BASE}/commandes/${id}/statut`, { status })).data;