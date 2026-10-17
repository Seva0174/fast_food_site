import api from './axios';
import { paramsPeriode } from '@/lib/statistiques';

const BASE = '/admin/statistiques';

// Ces fonctions renvoient directement les données de la réponse.
// La période est { debut, fin } ou null pour la vue globale.

export const getStatsGlobalesApi = async () => (await api.get(`${BASE}/globales`)).data;

export const getStatsParPeriodeApi = async (debut, fin) =>
  (await api.get(`${BASE}/periode`, { params: { debut, fin } })).data;

export const getVentesProduitsApi = async (periode = null) =>
  (await api.get(`${BASE}/ventes-produits`, { params: paramsPeriode(periode) })).data;

export const getCommandesParJourApi = async (periode = null) =>
  (await api.get(`${BASE}/commandes-par-jour`, { params: paramsPeriode(periode) })).data;