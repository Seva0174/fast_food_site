import { createContext, useState, useEffect } from 'react';

export const ContextePanier = createContext();

export const FournisseurPanier = ({ children }) => {
  const [panier, setPanier] = useState(() => {
    const panierSauvegarde = localStorage.getItem('panier_fastfood');
    return panierSauvegarde ? JSON.parse(panierSauvegarde) : [];
  });

  useEffect(() => {
    localStorage.setItem('panier_fastfood', JSON.stringify(panier));
  }, [panier]);

  // Ajouter un produit ou augmenter sa quantité
  const ajouterAuPanier = (produit) => {
    setPanier((prevPanier) => {
      const existe = prevPanier.find((item) => item.id === produit.id);
      if (existe) {
        return prevPanier.map((item) =>
          item.id === produit.id
            ? { ...item, quantite: item.quantite + 1 }
            : item
        );
      }
      return [...prevPanier, { ...produit, quantite: 1 }];
    });
  };

  // Diminuer la quantité ou retirer si quantité = 1
  const retirerDuPanier = (idProduit) => {
    setPanier((prevPanier) => {
      const produitExistant = prevPanier.find((item) => item.id === idProduit);
      if (produitExistant?.quantite === 1) {
        return prevPanier.filter((item) => item.id !== idProduit);
      }
      return prevPanier.map((item) =>
        item.id === idProduit
          ? { ...item, quantite: item.quantite - 1 }
          : item
      );
    });
  };

  // Supprimer un produit totalement du panier
  const supprimerDuPanier = (idProduit) => {
    setPanier((prevPanier) => prevPanier.filter((item) => item.id !== idProduit));
  };

  // Vider le panier
  const viderPanier = () => {
    setPanier([]);
  };

  // Calcul du nombre total d'articles et du prix total
  const totalArticles = panier.reduce((acc, item) => acc + item.quantite, 0);
  const totalPrix = panier.reduce((acc, item) => acc + item.prix * item.quantite, 0);

  return (
    <ContextePanier.Provider
      value={{
        panier,
        ajouterAuPanier,
        retirerDuPanier,
        supprimerDuPanier,
        viderPanier,
        totalArticles,
        totalPrix,
      }}
    >
      {children}
    </ContextePanier.Provider>
  );
};