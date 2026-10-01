import { createContext, useState, useEffect, useContext, useRef } from 'react';
import {
  getPanierApi,
  ajouterProduitApi,
  modifierQuantiteApi,
  supprimerItemApi,
  viderPanierApi,
} from '../api/panierApi';
import { AuthContext } from './AuthProvider';

export const ContextePanier = createContext();

const CLE_PANIER_INVITE = 'panier_invite';

// Transforme la réponse du backend (PanierResponse) en liste utilisable par l'UI
const mapPanierResponse = (panierResponse) => {
  if (!panierResponse || !panierResponse.items) return [];
  return panierResponse.items.map((item) => ({
    id: item.id, // id de la ligne panier_items
    produitId: item.produitId,
    nom: item.nomProduit,
    prix: item.prixUnitaire,
    quantite: item.quantite,
  }));
};

const chargerPanierInviteLocal = () => {
  const sauvegarde = localStorage.getItem(CLE_PANIER_INVITE);
  return sauvegarde ? JSON.parse(sauvegarde) : [];
};

export const FournisseurPanier = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [panier, setPanier] = useState(chargerPanierInviteLocal);
  const [chargement, setChargement] = useState(false);

  const dejaSynchronise = useRef(false);
  const etaitAuthentifie = useRef(isAuthenticated);

  // Charger ou synchroniser le panier au statut connecté
  useEffect(() => {
    if (isAuthenticated && !dejaSynchronise.current) {
      dejaSynchronise.current = true;
      chargerOuSynchroniserPanier();
    }
  }, [isAuthenticated]);

  // Réinitialisation lors de la déconnexion
  useEffect(() => {
    if (!isAuthenticated && etaitAuthentifie.current) {
      localStorage.removeItem(CLE_PANIER_INVITE);
      dejaSynchronise.current = false;
      setPanier([]);
    }
    etaitAuthentifie.current = isAuthenticated;
  }, [isAuthenticated]);

  const chargerOuSynchroniserPanier = async () => {
    setChargement(true);
    try {
      const panierInvite = chargerPanierInviteLocal();
      
      if (panierInvite.length > 0) {
        // Fusionner le panier invité vers le backend
        localStorage.removeItem(CLE_PANIER_INVITE);
        let panierBackend = mapPanierResponse(await getPanierApi());

        for (const item of panierInvite) {
          panierBackend = mapPanierResponse(
            await ajouterProduitApi(item.produitId, item.quantite)
          );
        }
        setPanier(panierBackend);
      } else {
        // Récupérer le panier existant depuis le backend
        const res = await getPanierApi();
        setPanier(mapPanierResponse(res));
      }
    } catch (error) {
      console.error('Erreur lors du chargement/synchronisation du panier :', error);
    } finally {
      setChargement(false);
    }
  };

  // Ajoute un produit au panier ou incrémente sa quantité
  const ajouterAuPanier = async (produitOuId) => {
    // Extraire l'id du produit selon le type de paramètre transmis
    let produitId = null;
    let itemId = null;

    if (typeof produitOuId === 'object' && produitOuId !== null) {
      produitId = produitOuId.produitId || produitOuId.id;
      itemId = produitOuId.id;
    } else {
      produitId = produitOuId;
    }

    if (isAuthenticated) {
      try {
        // Recherche si l'élément fait déjà partie du panier en état React
        const itemExistant = panier.find(
          (i) => i.id === itemId || i.produitId === produitId
        );

        let res;
        if (itemExistant) {
          res = await modifierQuantiteApi(itemExistant.id, itemExistant.quantite + 1);
        } else {
          res = await ajouterProduitApi(produitId, 1);
        }
        setPanier(mapPanierResponse(res));
      } catch (error) {
        console.error("Erreur lors de l'ajout au panier :", error);
      }
      return;
    }

    // Mode invité
    setPanier((prev) => {
      const existant = prev.find((item) => item.produitId === produitId);
      const nouveau = existant
        ? prev.map((item) =>
            item.produitId === produitId
              ? { ...item, quantite: item.quantite + 1 }
              : item
          )
        : [
            ...prev,
            {
              id: produitId,
              produitId: produitId,
              nom: produitOuId.nom || 'Produit',
              prix: produitOuId.prix || 0,
              quantite: 1,
            },
          ];
      localStorage.setItem(CLE_PANIER_INVITE, JSON.stringify(nouveau));
      return nouveau;
    });
  };

  // Diminue la quantité d'un item ou le retire si quantite <= 1
  const retirerDuPanier = async (itemId) => {
    const item = panier.find((i) => i.id === itemId || i.produitId === itemId);
    if (!item) return;

    const targetId = item.id;

    if (isAuthenticated) {
      try {
        const data =
          item.quantite <= 1
            ? await supprimerItemApi(targetId)
            : await modifierQuantiteApi(targetId, item.quantite - 1);
        setPanier(mapPanierResponse(data));
      } catch (error) {
        console.error('Erreur lors de la mise à jour du panier :', error);
      }
      return;
    }

    setPanier((prev) => {
      const nouveau =
        item.quantite <= 1
          ? prev.filter((i) => i.id !== targetId)
          : prev.map((i) =>
              i.id === targetId ? { ...i, quantite: i.quantite - 1 } : i
            );
      localStorage.setItem(CLE_PANIER_INVITE, JSON.stringify(nouveau));
      return nouveau;
    });
  };

  // Supprime totalement un item du panier
  const supprimerDuPanier = async (itemId) => {
    const item = panier.find((i) => i.id === itemId || i.produitId === itemId);
    const targetId = item ? item.id : itemId;

    if (isAuthenticated) {
      try {
        const data = await supprimerItemApi(targetId);
        setPanier(mapPanierResponse(data));
      } catch (error) {
        console.error('Erreur lors de la suppression du produit :', error);
      }
      return;
    }

    setPanier((prev) => {
      const nouveau = prev.filter((i) => i.id !== targetId);
      localStorage.setItem(CLE_PANIER_INVITE, JSON.stringify(nouveau));
      return nouveau;
    });
  };

  // Vide entièrement le panier
  const viderPanier = async () => {
    if (isAuthenticated) {
      try {
        await viderPanierApi();
        setPanier([]);
      } catch (error) {
        console.error('Erreur lors du vidage du panier :', error);
      }
      return;
    }

    localStorage.removeItem(CLE_PANIER_INVITE);
    setPanier([]);
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