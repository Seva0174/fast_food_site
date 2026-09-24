import api from './axios';

export const adminApi = {
  // Statistiques
  getStatsGlobales: () => api.get('/admin/statistiques/globales'),
  getStatsParPeriode: (debut, fin) => api.get('/admin/statistiques/periode', { params: { debut, fin } }),
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

  // Employés, Heures & Salaires
  getEmployes: () => api.get('/admin/employes'),
  getEmployeParId: (id) => api.get(`/admin/employes/${id}`),
  creerEmploye: (data) => api.post('/admin/employes', data),
  modifierEmploye: (id, data) => api.put(`/admin/employes/${id}`, data),
  supprimerEmploye: (id) => api.delete(`/admin/employes/${id}`),

  // Heures & Planning
  ajouterHeuresEmploye: (data) => api.post('/admin/employes/heures', data),
  getHeuresEmploye: (id) => api.get(`/admin/employes/${id}/heures`),
  getHeuresEmployeParPeriode: (id, debut, fin) =>
    api.get(`/admin/employes/${id}/heures/periode`, { params: { debut, fin } }),
  supprimerHeuresEmploye: (idHeure) => api.delete(`/admin/employes/heures/${idHeure}`),

  // Salaires
  getSalaireMensuelEmploye: (id, annee, mois) =>
    api.get(`/admin/employes/${id}/salaire`, { params: { annee, mois } })
};