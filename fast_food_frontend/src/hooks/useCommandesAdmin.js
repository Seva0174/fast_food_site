import { useCallback, useEffect, useRef, useState } from 'react';
import { getAllCommandesApi, changerStatusCommandeApi } from '../api/commandeApi';
import { INTERVALLE_ACTUALISATION_MS, LIBELLES_STATUT } from '../lib/commande';
import { useMessage } from './useMessage';

// Chargement des commandes et changement de statut pour l'administration.
// La liste se recharge toute seule ; les commandes arrivees depuis le dernier chargement
// sont signalees dans nouvellesIds.
export const useCommandesAdmin = () => {
  const [commandes, setCommandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [miseAJourId, setMiseAJourId] = useState(null);
  const [derniereMaj, setDerniereMaj] = useState(null);
  const [nouvellesIds, setNouvellesIds] = useState([]);
  const { message, afficher } = useMessage();

  const idsConnus = useRef(null);
  // Incrementee a chaque changement de statut : une reponse partie avant est perimee.
  const versionListe = useRef(0);

  // Affiche la liste recue et repere les commandes jamais vues (pas au premier chargement).
  const appliquerListe = useCallback(
    (liste) => {
      if (idsConnus.current) {
        const arrivees = liste.filter((c) => !idsConnus.current.has(c.id));
        if (arrivees.length > 0) {
          setNouvellesIds((prev) => [...prev, ...arrivees.map((c) => c.id)]);
          afficher(
            arrivees.length === 1
              ? `Nouvelle commande #${arrivees[0].id}`
              : `${arrivees.length} nouvelles commandes`,
            'succes',
            8000
          );
        }
      }
      idsConnus.current = new Set(liste.map((c) => c.id));
      setCommandes(liste);
      setDerniereMaj(new Date());
    },
    [afficher]
  );

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur('');
    try {
      appliquerListe(await getAllCommandesApi());
    } catch {
      setErreur('Impossible de charger les commandes.');
    } finally {
      setChargement(false);
    }
  }, [appliquerListe]);

  // Actualisation automatique : en cas d'echec on garde la liste affichee,
  // l'heure de derniere mise a jour reste alors celle du dernier succes.
  const actualiserEnFond = useCallback(async () => {
    const version = versionListe.current;
    try {
      const liste = await getAllCommandesApi();
      if (version === versionListe.current) appliquerListe(liste);
    } catch {
      // ignore : la prochaine tentative reessaiera
    }
  }, [appliquerListe]);

  useEffect(() => {
    charger();
  }, [charger]);

  // Pas d'actualisation pendant qu'un statut est en cours de modification.
  useEffect(() => {
    if (miseAJourId !== null) return undefined;
    const minuterie = setInterval(actualiserEnFond, INTERVALLE_ACTUALISATION_MS);
    return () => clearInterval(minuterie);
  }, [actualiserEnFond, miseAJourId]);

  // Renvoie la commande modifiee, ou null en cas d'echec.
  const changerStatut = useCallback(
    async (id, statut) => {
      versionListe.current += 1;
      setMiseAJourId(id);
      try {
        const modifiee = await changerStatusCommandeApi(id, statut);
        setCommandes((prev) => prev.map((c) => (c.id === id ? modifiee : c)));
        afficher(`Commande #${id} : ${LIBELLES_STATUT[statut] ?? statut}`);
        return modifiee;
      } catch {
        afficher(`Le statut de la commande #${id} n'a pas changé. Réessayez.`, 'erreur', 8000);
        return null;
      } finally {
        versionListe.current += 1;
        setMiseAJourId(null);
      }
    },
    [afficher]
  );

  return {
    commandes,
    chargement,
    erreur,
    message,
    miseAJourId,
    derniereMaj,
    nouvellesIds,
    charger,
    changerStatut,
  };
};
