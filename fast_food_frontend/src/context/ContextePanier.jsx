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

const mapPanierResponse = (panierResponse) => {
  if (!panierResponse || !panierResponse.items) return [];
  return panierResponse.items.map((item) => ({
    id: item.id,
    produitId: item.produitId,
    nom: item.nomProduit,
    prix: item.prixUnitaire,
    quantite: item.quantite,
    options: item.options || [],
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

  // Déclarée avant l'utilisation dans useEffect
  const chargerOuSynchroniserPanier = async () => {
    setChargement(true);
    try {
      const panierInvite = chargerPanierInviteLocal();
      
      if (panierInvite.length > 0) {
        localStorage.removeItem(CLE_PANIER_INVITE);
        let panierBackend = mapPanierResponse(await getPanierApi());

        for (const item of panierInvite) {
          panierBackend = mapPanierResponse(
            await ajouterProduitApi(item.produitId, item.quantite, item.optionItemIds || [])
          );
        }
        setPanier(panierBackend);
      } else {
        const res = await getPanierApi();
        setPanier(mapPanierResponse(res));
      }
    } catch (error) {
      console.error('Erreur lors du chargement/synchronisation du panier :', error);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !dejaSynchronise.current) {
      dejaSynchronise.current = true;
      chargerOuSynchroniserPanier();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated && etaitAuthentifie.current) {
      localStorage.removeItem(CLE_PANIER_INVITE);
      dejaSynchronise.current = false;
      setPanier([]);
    }
    etaitAuthentifie.current = isAuthenticated;
  }, [isAuthenticated]);

  const ajouterAuPanier = async (produitOuId, optionItemIds = []) => {
    let produitId = typeof produitOuId === 'object' && produitOuId !== null
      ? (produitOuId.produitId || produitOuId.id)
      : produitOuId;

    if (isAuthenticated) {
      try {
        const res = await ajouterProduitApi(produitId, 1, optionItemIds);
        setPanier(mapPanierResponse(res));
      } catch (error) {
        console.error("Erreur lors de l'ajout au panier :", error);
      }
      return;
    }

    setPanier((prev) => {
      const nouveau = [
        ...prev,
        {
          id: Date.now(),
          produitId: produitId,
          nom: produitOuId.nom || 'Produit',
          prix: produitOuId.prix || 0,
          quantite: 1,
          optionItemIds: optionItemIds,
          options: optionItemIds.map((id) => ({ id, nom: 'Option' })),
        },
      ];
      localStorage.setItem(CLE_PANIER_INVITE, JSON.stringify(nouveau));
      return nouveau;
    });
  };

  const incrementerQuantite = async (itemId) => {
    const item = panier.find((i) => i.id === itemId);
    if (!item) return;

    if (isAuthenticated) {
      try {
        const data = await modifierQuantiteApi(item.id, item.quantite + 1);
        setPanier(mapPanierResponse(data));
      } catch (error) {
        console.error('Erreur lors de l’incrémentation du produit :', error);
      }
      return;
    }

    setPanier((prev) => {
      const nouveau = prev.map((i) =>
        i.id === item.id ? { ...i, quantite: i.quantite + 1 } : i
      );
      localStorage.setItem(CLE_PANIER_INVITE, JSON.stringify(nouveau));
      return nouveau;
    });
  };

  const modifierItemPanier = async (itemId, optionItemIds = []) => {
    if (isAuthenticated) {
      try {
        const itemExistant = panier.find((i) => i.id === itemId);
        if (!itemExistant) return;

        // 1. Supprimer l'ancien item du panier backend
        await supprimerItemApi(itemId);

        // 2. Ajouter le produit avec ses nouvelles options
        const res = await ajouterProduitApi(
          itemExistant.produitId,
          itemExistant.quantite,
          optionItemIds
        );

        setPanier(mapPanierResponse(res));
      } catch (error) {
        console.error('Erreur lors de la modification du produit :', error);
      }
      return;
    }

    // --- Mode Invité (LocalStorage) ---
    setPanier((prev) => {
      const nouveau = prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            optionItemIds: optionItemIds,
            options: optionItemIds.map((id) => ({ id, nom: 'Option' })),
          };
        }
        return item;
      });
      localStorage.setItem(CLE_PANIER_INVITE, JSON.stringify(nouveau));
      return nouveau;
    });
  };

  const retirerDuPanier = async (itemId) => {
    const item = panier.find((i) => i.id === itemId);
    if (!item) return;

    if (isAuthenticated) {
      try {
        const data =
          item.quantite <= 1
            ? await supprimerItemApi(item.id)
            : await modifierQuantiteApi(item.id, item.quantite - 1);
        setPanier(mapPanierResponse(data));
      } catch (error) {
        console.error('Erreur lors de la mise à jour du panier :', error);
      }
      return;
    }

    setPanier((prev) => {
      const nouveau =
        item.quantite <= 1
          ? prev.filter((i) => i.id !== item.id)
          : prev.map((i) =>
              i.id === item.id ? { ...i, quantite: i.quantite - 1 } : i
            );
      localStorage.setItem(CLE_PANIER_INVITE, JSON.stringify(nouveau));
      return nouveau;
    });
  };

  const supprimerDuPanier = async (itemId) => {
    if (isAuthenticated) {
      try {
        const data = await supprimerItemApi(itemId);
        setPanier(mapPanierResponse(data));
      } catch (error) {
        console.error('Erreur lors de la suppression du produit :', error);
      }
      return;
    }

    setPanier((prev) => {
      const nouveau = prev.filter((i) => i.id !== itemId);
      localStorage.setItem(CLE_PANIER_INVITE, JSON.stringify(nouveau));
      return nouveau;
    });
  };

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
        incrementerQuantite,
        modifierItemPanier,
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