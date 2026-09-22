import api from './axios';

export const adminApi = {
  // Statistiques
  getStatsGlobales: () => api.get('/admin/statistiques/globales'),
  getStatsParPeriode: (debut, fin) =>  api.get('/admin/statistiques/periode', { params: { debut, fin } }),
  getVentesProduits: () => api.get('/admin/statistiques/ventes-produits'),
  getCommandesParJour: () => api.get('/admin/statistiques/commandes-par-jour'),

  // Approvisionnement & Fournisseurs
  getFournisseurs: () => api.get('/admin/approvisionnement/fournisseurs'),
  getCommandesFournisseurs: () => api.get('/admin/approvisionnement/commandes'),
  creerCommandeFournisseur: (data) => api.post('/admin/approvisionnement/commandes', data),
  changerStatutCommandeFournisseur: (id, status) =>
    api.patch(`/admin/approvisionnement/commandes/${id}/statut`, { status }),

  // Gestion des Produits / Carte
  getProduits: () => api.get('/produits'),
  getCategories: () => api.get('/categories'),
  creerProduit: (data) => api.post('/produits', data),
  modifierProduit: (id, data) => api.put(`/produits/${id}`, data),
  toggleDisponibilite: (id) => api.patch(`/produits/${id}/disponibilite`),
  supprimerProduit: (id) => api.delete(`/produits/${id}`),
  
  // Employés & Salaires
  getEmployes: () => api.get('/admin/employes'),
  creerEmploye: (data) => api.post('/admin/employes', data),
  ajouterHeuresEmploye: (id, data) => api.post(`/admin/employes/${id}/heures`, data),
};