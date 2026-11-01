import { useCallback, useEffect, useRef, useState } from 'react';
import { getCategories, getProduits } from '../api/menuApi';
import { preparerCarte } from '../lib/produit';

const MESSAGE_ERREUR = 'La carte n’a pas pu être chargée.';

const recupererCarte = async () => {
  const [categories, produits] = await Promise.all([getCategories(), getProduits()]);
  return { categories, produits: preparerCarte(produits) };
};

export const useCarte = () => {
  const [categories, setCategories] = useState([]);
  const [produits, setProduits] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // Evite de mettre a jour l'etat si le composant est demonte pendant le chargement
  const monte = useRef(true);

  const appliquer = useCallback((promesse) => {
    promesse
      .then((carte) => {
        if (!monte.current) return;
        setCategories(carte.categories);
        setProduits(carte.produits);
      })
      .catch((e) => {
        console.error('Erreur lors du chargement de la carte :', e);
        if (monte.current) setErreur(MESSAGE_ERREUR);
      })
      .finally(() => {
        if (monte.current) setChargement(false);
      });
  }, []);

  // Rechargement manuel (bouton "Réessayer")
  const charger = useCallback(() => {
    setChargement(true);
    setErreur(null);
    appliquer(recupererCarte());
  }, [appliquer]);

  useEffect(() => {
    monte.current = true;
    appliquer(recupererCarte());
    return () => {
      monte.current = false;
    };
  }, [appliquer]);

  return { categories, produits, chargement, erreur, charger };
};
