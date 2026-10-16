import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { extraireMessageErreur } from '../lib/erreurs';
import {
  getPanierApi,
  ajouterProduitApi,
  modifierQuantiteApi,
  supprimerItemApi,
  viderPanierApi,
} from '../api/panierApi';
import { AuthContext } from './AuthProvider';
import {
  mapPanierResponse,
  creerArticleInvite,
  modifierArticleInvite,
  regrouperArticlesIdentiques,
  changerQuantiteArticle,
  supprimerArticle,
} from '../lib/panier';

export const ContextePanier = createContext();

const CLE_PANIER_INVITE = 'panier_invite';

const chargerPanierInviteLocal = () => {
  const sauvegarde = localStorage.getItem(CLE_PANIER_INVITE);
  return sauvegarde ? JSON.parse(sauvegarde) : [];
};

const sauvegarderPanierInviteLocal = (articles) =>
  localStorage.setItem(CLE_PANIER_INVITE, JSON.stringify(articles));

export const FournisseurPanier = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [panier, setPanier] = useState(() => (isAuthenticated ? [] : chargerPanierInviteLocal()));
  const [chargement, setChargement] = useState(false);

  const dejaSynchronise = useRef(false);
  const etaitAuthentifie = useRef(isAuthenticated);

  const mettreAJourPanier = async (reponse) => {
    if (reponse?.items) {
      setPanier(mapPanierResponse(reponse));
    } else {
      setPanier(mapPanierResponse(await getPanierApi()));
    }
  };

  // Panier invite : on calcule le nouveau panier, on le sauvegarde, puis une seule mise a jour d'etat.
  // La transformation est une fonction pure (voir lib/panier.js).
  const mettreAJourInvite = (transformation) => {
    const nouveau = transformation(panier);
    sauvegarderPanierInviteLocal(nouveau);
    setPanier(nouveau);
  };

  // Declaree avant l'utilisation dans useEffect
  const chargerOuSynchroniserPanier = async () => {
    setChargement(true);
    try {
      const panierInvite = chargerPanierInviteLocal();

      if (panierInvite.length > 0) {
        localStorage.removeItem(CLE_PANIER_INVITE);
        let panierBackend = mapPanierResponse(await getPanierApi());

        for (const item of panierInvite) {
          // Un produit devenu invalide (rupture, menu modifie...) ne doit pas bloquer les autres
          try {
            panierBackend = mapPanierResponse(
              await ajouterProduitApi(
                item.produitId,
                item.quantite,
                item.optionItemIds || [],
                item.choixFormule || []
              )
            );
          } catch (error) {
            console.error(`Impossible de synchroniser "${item.nom}" :`, error);
          }
        }
        setPanier(panierBackend);
      } else {
        setPanier(mapPanierResponse(await getPanierApi()));
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

  // produit : produit de la carte (voir ProduitMenuResponse)
  // choixFormule : produits choisis dans un menu (voir FormuleCompositionModal)
  const ajouterAuPanier = async (produit, optionItemIds = [], choixFormule = []) => {
    if (isAuthenticated) {
      try {
        const res = await ajouterProduitApi(produit.id, 1, optionItemIds, choixFormule);
        await mettreAJourPanier(res);
      } catch (error) {
        console.error("Erreur lors de l'ajout au panier :", error);
        const message = extraireMessageErreur(error);
        if (message) alert(message);
      }
      return;
    }

    const article = creerArticleInvite(Date.now(), produit, optionItemIds, choixFormule);
    mettreAJourInvite((prev) => regrouperArticlesIdentiques([...prev, article]));
  };

  const incrementerQuantite = async (itemId) => {
    const item = panier.find((i) => i.id === itemId);
    if (!item) return;

    if (isAuthenticated) {
      try {
        const data = await modifierQuantiteApi(item.id, item.quantite + 1);
        await mettreAJourPanier(data);
      } catch (error) {
        console.error("Erreur lors de l'incrementation du produit :", error);
      }
      return;
    }

    mettreAJourInvite((prev) => changerQuantiteArticle(prev, item.id, item.quantite + 1));
  };

  const modifierItemPanier = async (itemId, produit, optionItemIds = [], choixFormule = []) => {
    if (isAuthenticated) {
      const itemExistant = panier.find((i) => i.id === itemId);
      if (!itemExistant) return;

      try {
        await ajouterProduitApi(
          itemExistant.produitId,
          itemExistant.quantite,
          optionItemIds,
          choixFormule
        );
        const data = await supprimerItemApi(itemId);
        await mettreAJourPanier(data);
      } catch (error) {
        console.error('Erreur lors de la modification du produit :', error);
        const message = extraireMessageErreur(error);
        if (message) alert(message);
      }
      return;
    }

    // Les articles devenus identiques apres la modification sont regroupes
    mettreAJourInvite((prev) =>
      regrouperArticlesIdentiques(
        prev.map((article) =>
          article.id === itemId
            ? modifierArticleInvite(article, produit, optionItemIds, choixFormule)
            : article
        )
      )
    );
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
        await mettreAJourPanier(data);
      } catch (error) {
        console.error('Erreur lors de la mise a jour du panier :', error);
      }
      return;
    }

    mettreAJourInvite((prev) =>
      item.quantite <= 1
        ? supprimerArticle(prev, item.id)
        : changerQuantiteArticle(prev, item.id, item.quantite - 1)
    );
  };

  const supprimerDuPanier = async (itemId) => {
    if (isAuthenticated) {
      try {
        const data = await supprimerItemApi(itemId);
        await mettreAJourPanier(data);
      } catch (error) {
        console.error('Erreur lors de la suppression du produit :', error);
      }
      return;
    }

    mettreAJourInvite((prev) => supprimerArticle(prev, itemId));
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