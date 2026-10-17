import { useCallback, useEffect, useState } from 'react';
import {
  changerStatutCommandeFournisseurApi,
  creerCommandeFournisseurApi,
  getCommandesFournisseursApi,
} from '@/api/approvisionnementApi';
import { extraireMessageErreur } from '@/lib/erreurs';
import { STATUT_COMMANDE } from '@/lib/approvisionnement';

// Historique des commandes fournisseurs, création et changement de statut.
export const useCommandesFournisseurs = (afficher) => {
  const [commandes, setCommandes] = useState([]);
  const [chargement, setChargement] = useState(false);

  const charger = useCallback(async () => {
    try {
      setCommandes(await getCommandesFournisseursApi());
    } catch {
      afficher("Erreur lors du chargement des commandes d'achat", 'erreur');
    }
  }, [afficher]);

  useEffect(() => {
    charger();
  }, [charger]);

  // Renvoie true si la commande a été créée.
  const creer = async (payload) => {
    setChargement(true);
    try {
      await creerCommandeFournisseurApi(payload);
      afficher("Commande d'approvisionnement envoyée !");
      await charger();
      return true;
    } catch (err) {
      afficher(extraireMessageErreur(err) || 'Erreur lors du passage de la commande', 'erreur');
      return false;
    } finally {
      setChargement(false);
    }
  };

  const changerStatut = async (id, statut) => {
    try {
      await changerStatutCommandeFournisseurApi(id, statut);
      afficher(
        statut === STATUT_COMMANDE.RECUE ? 'Commande reçue : le stock a été crédité !' : 'Statut mis à jour'
      );
      await charger();
    } catch (err) {
      afficher(extraireMessageErreur(err) || 'Erreur lors du changement de statut', 'erreur');
    }
  };

  return { commandes, chargement, charger, creer, changerStatut };
};