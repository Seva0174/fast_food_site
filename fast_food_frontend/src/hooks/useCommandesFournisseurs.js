import { useCallback, useEffect, useState } from 'react';
import {
  changerStatutCommandeFournisseurApi,
  creerCommandeFournisseurApi,
  getCommandesFournisseursApi,
} from '@/api/approvisionnementApi';
import { extraireMessageErreur } from '@/lib/erreurs';
import { messageStatutChange } from '@/lib/approvisionnement';

// Historique des commandes fournisseurs, création et changement de statut.
// chargement : premier chargement de l'historique ; enCours : une action attend le serveur.
export const useCommandesFournisseurs = (afficher) => {
  const [commandes, setCommandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [enCours, setEnCours] = useState(false);

  const charger = useCallback(async () => {
    try {
      setCommandes(await getCommandesFournisseursApi());
      setErreur('');
    } catch {
      setErreur("Impossible de charger l'historique des commandes fournisseurs.");
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  // Renvoie true si la commande a été créée.
  const creer = async (payload) => {
    setEnCours(true);
    try {
      await creerCommandeFournisseurApi(payload);
      afficher('Commande fournisseur enregistrée');
      await charger();
      return true;
    } catch (err) {
      afficher(extraireMessageErreur(err) || 'Erreur lors de la création de la commande fournisseur', 'erreur');
      return false;
    } finally {
      setEnCours(false);
    }
  };

  // Renvoie true si le statut a changé.
  const changerStatut = async (id, statut) => {
    setEnCours(true);
    try {
      await changerStatutCommandeFournisseurApi(id, statut);
      afficher(messageStatutChange(statut));
      await charger();
      return true;
    } catch (err) {
      afficher(extraireMessageErreur(err) || 'Erreur lors du changement de statut', 'erreur');
      return false;
    } finally {
      setEnCours(false);
    }
  };

  return { commandes, chargement, erreur, enCours, charger, creer, changerStatut };
};
