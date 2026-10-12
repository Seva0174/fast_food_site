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

// Produit choisi dans un menu, tel que stocké dans le panier
const mapComposant = (composant) => ({
  id: composant.id,
  idGroupe: composant.idGroupe,
  nomGroupe: composant.nomGroupe,
  produitId: composant.produitId,
  nom: composant.nomProduit,
  options: composant.options ?? [],
  supplement: Number(composant.surcoutEmplacement ?? 0),
});

const mapPanierResponse = (panierResponse) => {
  if (!panierResponse?.items) return [];
  return panierResponse.items.map((item) => ({
    id: item.id,
    produitId: item.produitId,
    nom: item.nomProduit,
    prix: Number(item.prixUnitaire ?? 0),
    quantite: item.quantite,
    options: item.options ?? [],
    composants: (item.composants ?? []).map(mapComposant),
    estFormule: (item.composants ?? []).length > 0,
  }));
};

// Convertit un choix de menu (panier invité) en composant affichable
const composantDepuisChoix = (choix) => ({
  id: `${choix.idGroupe}-${choix.idProduit}`,
  idGroupe: choix.idGroupe,
  nomGroupe: choix.nomGroupe,
  produitId: choix.idProduit,
  nom: choix.nomProduit,
  options: choix.optionsDetails || [],
  supplement: Number(choix.supplement || 0),
});

const additionnerSupplements = (choixFormule) =>
  choixFormule.reduce((total, choix) => total + Number(choix.supplement || 0), 0);

// Empreinte d'un article : deux articles avec la meme empreinte sont identiques.
// Les listes sont triees pour que l'ordre de selection n'ait pas d'importance.
const cleArticle = (produitId, optionItemIds = [], choixFormule = []) =>
  JSON.stringify({
    produitId,
    options: [...optionItemIds].sort((a, b) => a - b),
    choix: choixFormule
      .map((choix) => ({
        groupe: choix.idGroupe,
        produit: choix.idProduit,
        options: [...(choix.optionIds ?? [])].sort((a, b) => a - b),
      }))
      .sort((a, b) => a.groupe - b.groupe || a.produit - b.produit),
  });


const extraireMessageErreur = (error) => {
  const data = error?.response?.data;
  if (data?.messages && Array.isArray(data.messages)) return data.messages.join(' | ');
  return data?.message || null;
};

const chargerPanierInviteLocal = () => {
  const sauvegarde = localStorage.getItem(CLE_PANIER_INVITE);
  return sauvegarde ? JSON.parse(sauvegarde) : [];
};

export const FournisseurPanier = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [panier, setPanier] = useState(() =>
    isAuthenticated ? [] : chargerPanierInviteLocal()
  );
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

  const mettreAJourInvite = (transformation) => {
    setPanier((prev) => {
      const nouveau = transformation(prev);
      localStorage.setItem(CLE_PANIER_INVITE, JSON.stringify(nouveau));
      return nouveau;
    });
  };

  // Déclarée avant l'utilisation dans useEffect
  const chargerOuSynchroniserPanier = async () => {
    setChargement(true);
    try {
      const panierInvite = chargerPanierInviteLocal();
      
      if (panierInvite.length > 0) {
        localStorage.removeItem(CLE_PANIER_INVITE);
        let panierBackend = mapPanierResponse(await getPanierApi());

        for (const item of panierInvite) {
          // Un produit devenu invalide (rupture, menu modifié...) ne doit pas bloquer les autres
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

  // choixFormule : produits choisis dans un menu (voir FormuleCompositionModal)
  const ajouterAuPanier = async (produitOuId, optionItemIds = [], choixFormule = []) => {
    let produitId = typeof produitOuId === 'object' && produitOuId !== null
      ? (produitOuId.produitId || produitOuId.id)
      : produitOuId;

    if (isAuthenticated) {
      try {
        const res = await ajouterProduitApi(produitId, 1, optionItemIds, choixFormule);
        await mettreAJourPanier(res);
      } catch (error) {
        console.error("Erreur lors de l'ajout au panier :", error);
        const message = extraireMessageErreur(error);
        if (message) alert(message);
      }
      return;
    }

    const prixBase = Number(produitOuId.prix || 0);
    const nouvelArticle = {
      id: Date.now(),
      produitId,
      nom: produitOuId.nom || 'Produit',
      prixBase,
      prix: prixBase + additionnerSupplements(choixFormule),
      quantite: 1,
      optionItemIds,
      options: optionItemIds.map((id) => ({ id, nom: 'Option' })),
      choixFormule,
      composants: choixFormule.map(composantDepuisChoix),
      estFormule: choixFormule.length > 0 || !!produitOuId.estFormule,
    };

    mettreAJourInvite((prev) => {
      const cle = cleArticle(produitId, optionItemIds, choixFormule);
      const existant = prev.find(
        (article) =>
          cleArticle(article.produitId, article.optionItemIds, article.choixFormule) === cle
      );

      if (!existant) return [...prev, nouvelArticle];

      return prev.map((article) =>
        article.id === existant.id ? { ...article, quantite: article.quantite + 1 } : article
      );
    });
  };

  const incrementerQuantite = async (itemId) => {
    const item = panier.find((i) => i.id === itemId);
    if (!item) return;

    if (isAuthenticated) {
      try {
        const data = await modifierQuantiteApi(item.id, item.quantite + 1);
        await mettreAJourPanier(data);
      } catch (error) {
        console.error('Erreur lors de l’incrémentation du produit :', error);
      }
      return;
    }

    mettreAJourInvite((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, quantite: i.quantite + 1 } : i))
    );
  };

  const modifierItemPanier = async (itemId, optionItemIds = [], choixFormule = []) => {
    if (isAuthenticated) {
      const itemExistant = panier.find((i) => i.id === itemId);
      if (!itemExistant) return;

      try {
        // Ajouter d'abord : si cela echoue, l'ancien article reste dans le panier
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

    mettreAJourInvite((prev) => {
    const modifie = prev.map((article) => {
      if (article.id !== itemId) return article;

      const prixBase = article.prixBase ?? article.prix;
      return {
        ...article,
        prixBase,
        prix: prixBase + additionnerSupplements(choixFormule),
        optionItemIds,
        options: optionItemIds.map((id) => ({ id, nom: 'Option' })),
        choixFormule,
        composants: choixFormule.map(composantDepuisChoix),
      };
    });

    // Regroupe les articles devenus identiques
    return modifie.reduce((resultat, article) => {
      const cle = cleArticle(article.produitId, article.optionItemIds, article.choixFormule);
      const existant = resultat.find(
        (a) => cleArticle(a.produitId, a.optionItemIds, a.choixFormule) === cle
      );

      if (!existant) return [...resultat, article];

      return resultat.map((a) =>
        a.id === existant.id ? { ...a, quantite: a.quantite + a.quantite + 0 + (article.quantite) - a.quantite } : a
      );
    }, []);
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
        await mettreAJourPanier(data);
      } catch (error) {
        console.error('Erreur lors de la mise à jour du panier :', error);
      }
      return;
    }

    mettreAJourInvite((prev) =>
      item.quantite <= 1
        ? prev.filter((i) => i.id !== item.id)
        : prev.map((i) => (i.id === item.id ? { ...i, quantite: i.quantite - 1 } : i))
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

    mettreAJourInvite((prev) => prev.filter((i) => i.id !== itemId));
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
