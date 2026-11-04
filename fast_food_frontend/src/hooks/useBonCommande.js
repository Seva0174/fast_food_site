import { useCallback, useState } from 'react';
import {
  ajouterArticle,
  decrementer,
  definirQuantite,
  incrementer,
  totalBon,
} from '@/lib/approvisionnement';

const AUCUNE_LIGNE = [];

// Bons de commande fournisseur en cours de préparation : un bon par fournisseur, pour pouvoir
// comparer les fournisseurs sans perdre ce qui a déjà été préparé. Les actions portent sur le bon
// du fournisseur sélectionné (idFournisseur).
export const useBonCommande = (idFournisseur) => {
  const [bons, setBons] = useState({});

  const modifierBon = useCallback(
    (transformer) =>
      setBons((precedents) => ({
        ...precedents,
        [idFournisseur]: transformer(precedents[idFournisseur] ?? AUCUNE_LIGNE),
      })),
    [idFournisseur]
  );

  const ajouter = useCallback(
    (article, uniteMesure) => modifierBon((bon) => ajouterArticle(bon, article, uniteMesure)),
    [modifierBon]
  );
  const incrementerLigne = useCallback((idStock) => modifierBon((bon) => incrementer(bon, idStock)), [modifierBon]);
  const decrementerLigne = useCallback((idStock) => modifierBon((bon) => decrementer(bon, idStock)), [modifierBon]);
  const modifierQuantite = useCallback(
    (idStock, saisie) => modifierBon((bon) => definirQuantite(bon, idStock, saisie)),
    [modifierBon]
  );
  const vider = useCallback(() => modifierBon(() => AUCUNE_LIGNE), [modifierBon]);

  // Fournisseur supprimé : son bon disparaît avec lui
  const oublier = useCallback(
    (id) =>
      setBons((precedents) => {
        const restants = { ...precedents };
        delete restants[id];
        return restants;
      }),
    []
  );

  const bon = bons[idFournisseur] ?? AUCUNE_LIGNE;

  return {
    bon,
    bons,
    total: totalBon(bon),
    ajouter,
    incrementer: incrementerLigne,
    decrementer: decrementerLigne,
    modifierQuantite,
    vider,
    oublier,
  };
};
