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
    id: item.id, // id de la ligne panier_items (utilisateur connecté uniquement)
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

  // Connexion (ou arrivée sur le site déjà connecté) : fusionne le panier invité
  // avec celui du backend, une seule fois.
  useEffect(() => {
    if (isAuthenticated && !dejaSynchronise.current) {
      dejaSynchronise.current = true;
      synchroniserPanierInvite();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Déconnexion : on efface tout panier précédent (invité ou backend) et on
  // repart d'un panier invité vide. Ne se déclenche que sur une vraie transition
  // connecté -> déconnecté, jamais au premier rendu.
  useEffect(() => {
    if (!isAuthenticated && etaitAuthentifie.current) {
      localStorage.removeItem(CLE_PANIER_INVITE);
      dejaSynchronise.current = false;
      setPanier([]);
    }
    etaitAuthentifie.current = isAuthenticated;
  }, [isAuthenticated]);

  const synchroniserPanierInvite = async () => {
    setChargement(true);
    try {
      const panierInvite = chargerPanierInviteLocal();
      localStorage.removeItem(CLE_PANIER_INVITE);

      let panierBackend = mapPanierResponse(await getPanierApi());

      for (const item of panierInvite) {
        panierBackend = mapPanierResponse(
          await ajouterProduitApi(item.produitId, item.quantite)
        );
      }

      setPanier(panierBackend);
    } catch (error) {
      console.error('Erreur lors de la synchronisation du panier invité :', error);
    } finally {
      setChargement(false);
    }
  };

  // Ajoute un produit au panier (ou augmente sa quantité si déjà présent)
  const ajouterAuPanier = async (produit) => {
    if (isAuthenticated) {
      try {
        const data = await ajouterProduitApi(produit.id, 1);
        setPanier(mapPanierResponse(data));
      } catch (error) {
        console.error("Erreur lors de l'ajout au panier :", error);
      }
      return;
    }

    // Mode invité : mise à jour du state ET persistance dans le même geste,
    // jamais via un effet réactif (pour éviter toute course avec la déconnexion).
    setPanier((prev) => {
      const existant = prev.find((item) => item.produitId === produit.id);
      const nouveau = existant
        ? prev.map((item) =>
            item.produitId === produit.id
              ? { ...item, quantite: item.quantite + 1 }
              : item
          )
        : [
            ...prev,
            {
              id: produit.id,
              produitId: produit.id,
              nom: produit.nom,
              prix: produit.prix,
              quantite: 1,
            },
          ];
      localStorage.setItem(CLE_PANIER_INVITE, JSON.stringify(nouveau));
      return nouveau;
    });
  };

  // Diminue la quantité d'un item, ou le retire si la quantité tombe à 0
  const retirerDuPanier = async (itemId) => {
    const item = panier.find((i) => i.id === itemId);
    if (!item) return;

    if (isAuthenticated) {
      try {
        const data =
          item.quantite <= 1
            ? await supprimerItemApi(itemId)
            : await modifierQuantiteApi(itemId, item.quantite - 1);
        setPanier(mapPanierResponse(data));
      } catch (error) {
        console.error('Erreur lors de la mise à jour du panier :', error);
      }
      return;
    }

    setPanier((prev) => {
      const nouveau =
        item.quantite <= 1
          ? prev.filter((i) => i.id !== itemId)
          : prev.map((i) =>
              i.id === itemId ? { ...i, quantite: i.quantite - 1 } : i
            );
      localStorage.setItem(CLE_PANIER_INVITE, JSON.stringify(nouveau));
      return nouveau;
    });
  };

  // Supprime totalement un item du panier
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
      const nouveau = prev.filter((item) => item.id !== itemId);
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