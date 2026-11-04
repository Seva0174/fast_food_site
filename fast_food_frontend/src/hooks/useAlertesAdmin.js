import { useCallback, useEffect, useState } from 'react';
import { getProduits } from '@/api/menuApi';
import { getMatieresPremieresApi } from '@/api/stockApi';
import { ETAT_FILTRE, compterEtats } from '@/lib/carte';
import { compterAReapprovisionner } from '@/lib/stock';

// Nombre de points à traiter par onglet de l'administration ({ stock, carte }), affichés dans la barre
// d'onglets avant même l'ouverture des vues. Une vue ouverte reprend ensuite la main avec `signaler`
// (ses propres chiffres sont à jour après chaque modification). Un échec laisse simplement les onglets
// sans repère : chaque vue affiche sa propre erreur.
export const useAlertesAdmin = () => {
  const [alertes, setAlertes] = useState({ stock: 0, carte: 0 });

  const charger = useCallback(async () => {
    const [stocks, produits] = await Promise.allSettled([getMatieresPremieresApi(), getProduits()]);
    setAlertes((precedentes) => ({
      stock: stocks.status === 'fulfilled' ? compterAReapprovisionner(stocks.value) : precedentes.stock,
      carte: produits.status === 'fulfilled' ? compterEtats(produits.value, {})[ETAT_FILTRE.A_CORRIGER] : precedentes.carte,
    }));
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  const signaler = useCallback(
    (id, nombre) => setAlertes((precedentes) => (precedentes[id] === nombre ? precedentes : { ...precedentes, [id]: nombre })),
    []
  );

  return { alertes, charger, signaler };
};
