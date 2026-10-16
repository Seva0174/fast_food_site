import { useCallback, useEffect, useState } from 'react';
import { getAllCommandesApi, changerStatusCommandeApi } from '../api/commandeApi';

// Chargement des commandes et changement de statut pour l'administration.
export const useCommandesAdmin = () => {
  const [commandes, setCommandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [miseAJourId, setMiseAJourId] = useState(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur('');
    try {
      setCommandes(await getAllCommandesApi());
    } catch (err) {
      setErreur('Impossible de charger les commandes.');
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  // Renvoie la commande modifiee, ou null en cas d'echec.
  const changerStatut = useCallback(async (id, statut) => {
    setMiseAJourId(id);
    try {
      const modifiee = await changerStatusCommandeApi(id, statut);
      setCommandes((prev) => prev.map((c) => (c.id === id ? modifiee : c)));
      return modifiee;
    } catch (err) {
      alert('Erreur lors du changement de statut de la commande.');
      return null;
    } finally {
      setMiseAJourId(null);
    }
  }, []);

  return { commandes, chargement, erreur, miseAJourId, charger, changerStatut };
};