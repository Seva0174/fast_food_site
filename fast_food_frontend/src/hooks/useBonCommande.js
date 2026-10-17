import { useCallback, useState } from 'react';
import {
  ajouterArticle,
  decrementer,
  definirQuantite,
  incrementer,
  totalBon,
} from '@/lib/approvisionnement';

// État du bon de commande fournisseur en cours de préparation.
export const useBonCommande = () => {
  const [bon, setBon] = useState([]);

  const ajouter = useCallback((article) => setBon((prev) => ajouterArticle(prev, article)), []);
  const incrementerLigne = useCallback((idStock) => setBon((prev) => incrementer(prev, idStock)), []);
  const decrementerLigne = useCallback((idStock) => setBon((prev) => decrementer(prev, idStock)), []);
  const modifierQuantite = useCallback(
    (idStock, saisie) => setBon((prev) => definirQuantite(prev, idStock, saisie)),
    []
  );
  const vider = useCallback(() => setBon([]), []);

  return {
    bon,
    total: totalBon(bon),
    ajouter,
    incrementer: incrementerLigne,
    decrementer: decrementerLigne,
    modifierQuantite,
    vider,
  };
};