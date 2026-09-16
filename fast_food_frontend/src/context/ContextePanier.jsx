import { createContext, useState, useEffect, useContext } from 'react';
import {
  getPanierApi,
  ajouterProduitApi,
  modifierQuantiteApi,
  supprimerItemApi,
  viderPanierApi,
} from '../api/panierApi';
import { AuthContext } from './AuthProvider';

export const ContextePanier = createContext();

// Transforme la réponse du backend (PanierResponse) en liste utilisable par l'UI
const mapPanierResponse = (panierResponse) => {
  if (!panierResponse || !panierResponse.items) return [];
  return panierResponse.items.map((item) => ({
    id: item.id, // id de la ligne panier_items (nécessaire pour modifier/supprimer)
    produitId: item.produitId,
    nom: item.nomProduit,
    prix: item.prixUnitaire,
    quantite: item.quantite,
  }));
};

export const FournisseurPanier = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [panier, setPanier] = useState([]);
  const [chargement, setChargement] = useState(false);

  // Charge le panier depuis le backend dès que l'utilisateur est authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      setPanier([]);
      return;
    }

    const chargerPanier = async () => {
      setChargement(true);
      try {
        const data = await getPanierApi();
        setPanier(mapPanierResponse(data));
      } catch (error) {
        console.error('Erreur lors du chargement du panier :', error);
      } finally {
        setChargement(false);
      }
    };

    chargerPanier();
  }, [isAuthenticated]);

  // Ajoute un produit au panier (ou augmente sa quantité si déjà présent)
  // "produit" doit contenir au minimum un champ "id" correspondant à l'id du produit
  const ajouterAuPanier = async (produit) => {
    if (!isAuthenticated) {
      console.error('Utilisateur non connecté : impossible d’ajouter au panier.');
      return;
    }
    try {
      const data = await ajouterProduitApi(produit.id, 1);
      setPanier(mapPanierResponse(data));
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier :", error);
    }
  };

  // Diminue la quantité d'un item, ou le retire si la quantité tombe à 0
  const retirerDuPanier = async (itemId) => {
    const item = panier.find((i) => i.id === itemId);
    if (!item) return;

    try {
      const data =
        item.quantite <= 1
          ? await supprimerItemApi(itemId)
          : await modifierQuantiteApi(itemId, item.quantite - 1);
      setPanier(mapPanierResponse(data));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du panier :', error);
    }
  };

  // Supprime totalement un item du panier
  const supprimerDuPanier = async (itemId) => {
    try {
      const data = await supprimerItemApi(itemId);
      setPanier(mapPanierResponse(data));
    } catch (error) {
      console.error('Erreur lors de la suppression du produit :', error);
    }
  };

  // Vide entièrement le panier
  const viderPanier = async () => {
    try {
      await viderPanierApi();
      setPanier([]);
    } catch (error) {
      console.error('Erreur lors du vidage du panier :', error);
    }
  };

  const totalArticles = panier.reduce((acc, item) => acc + item.quantite, 0);
  const totalPrix = panier.reduce((acc, item) => acc + item.prix * item.quantite, 0);

  return (
    <ContextePanier.Provider
      value={{
        panier,
        chargement,
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