import { useEffect, useState } from 'react';
import { getCategories, getProduits } from '../api/menuApi';

export const useCarte = () => {
  const [categories, setCategories] = useState([]);
  const [produits, setProduits] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    // Evite de mettre a jour l'etat si le composant est demonte pendant le chargement
    let annule = false;

    const charger = async () => {
      try {
        const [cats, prods] = await Promise.all([getCategories(), getProduits()]);
        if (!annule) {
          setCategories(cats);
          setProduits(prods);
        }
      } catch (erreur) {
        console.error('Erreur lors du chargement de la carte :', erreur);
      } finally {
        if (!annule) setChargement(false);
      }
    };

    charger();
    return () => {
      annule = true;
    };
  }, []);

  return { categories, produits, chargement };
};