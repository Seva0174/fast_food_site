import api from './axios';

export const adminApi = {
  // Conservé jusqu'à la factorisation de VueCarteAdmin (étape 10), qui le basculera sur stockApi.
  getMatieresPremieres: () => api.get('/admin/approvisionnement/matieres-premieres'),

  // Gestion des Produits / Carte
  getProduits: () => api.get('/produits'),
  getCategories: () => api.get('/categories'),
  creerProduit: (data) => api.post('/produits', data),
  modifierProduit: (id, data) => api.put(`/produits/${id}`, data),
  toggleDisponibilite: (id) => api.patch(`/produits/${id}/disponibilite`),
  supprimerProduit: (id) => api.delete(`/produits/${id}`),

  // Composition des menus (formules) : emplacements & produits proposés
  getGroupesFormule: (idFormule) => api.get(`/admin/formules/${idFormule}/groupes`),
  creerGroupeFormule: (idFormule, data) => api.post(`/admin/formules/${idFormule}/groupes`, data),
  modifierGroupeFormule: (idGroupe, data) => api.put(`/admin/formules/groupes/${idGroupe}`, data),
  supprimerGroupeFormule: (idGroupe) => api.delete(`/admin/formules/groupes/${idGroupe}`),

  ajouterProduitGroupeFormule: (idGroupe, data) => api.post(`/admin/formules/groupes/${idGroupe}/produits`, data),
  modifierSurcoutFormule: (idLien, data) => api.put(`/admin/formules/produits/${idLien}`, data),
  retirerProduitGroupeFormule: (idLien) => api.delete(`/admin/formules/produits/${idLien}`),
};