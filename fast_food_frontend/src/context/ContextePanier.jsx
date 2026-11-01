import { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import { extraireMessageErreur } from '../lib/erreurs';
import { useMessage } from '../hooks/useMessage';
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

// Un panier sauvegarde illisible (modifie a la main, ancienne version) est ignore plutot que de bloquer le site.
const chargerPanierInviteLocal = () => {
  try {
    const articles = JSON.parse(localStorage.getItem(CLE_PANIER_INVITE) ?? '[]');
    return Array.isArray(articles) ? articles : [];
  } catch {
    localStorage.removeItem(CLE_PANIER_INVITE);
    return [];
  }
};

const sauvegarderPanierInviteLocal = (articles) =>
  localStorage.setItem(CLE_PANIER_INVITE, JSON.stringify(articles));

export const FournisseurPanier = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [panier, setPanier] = useState(() => (isAuthenticated ? [] : chargerPanierInviteLocal()));
  // Connecte au chargement de la page : le panier du compte arrive du backend,
  // il est donc "en chargement" des le premier rendu (evite d'afficher un panier vide).
  const [chargement, setChargement] = useState(isAuthenticated);
  const { message, afficher } = useMessage();

  // Incremente a chaque ajout : la navbar et la barre mobile s'en servent pour rejouer une animation.
  const [nombreAjouts, setNombreAjouts] = useState(0);

  // Demande d'ouverture du panier (lien "Panier" de la navbar), lue par la page d'accueil.
  const [ouvertureDemandee, setOuvertureDemandee] = useState(false);
  const demanderOuverturePanier = useCallback(() => setOuvertureDemandee(true), []);
  const consommerOuverturePanier = useCallback(() => setOuvertureDemandee(false), []);

  const signalerErreur = (error, messageParDefaut) => {
    afficher(extraireMessageErreur(error) ?? messageParDefaut, 'erreur');
  };

  const confirmerAjout = (produit) => {
    setNombreAjouts((n) => n + 1);
    afficher(`${produit.nom} ajouté au panier`, 'succes');
  };

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
  // Renvoie true si l'article a bien ete ajoute.
  const ajouterAuPanier = async (produit, optionItemIds = [], choixFormule = []) => {
    if (isAuthenticated) {
      try {
        const res = await ajouterProduitApi(produit.id, 1, optionItemIds, choixFormule);
        await mettreAJourPanier(res);
      } catch (error) {
        console.error("Erreur lors de l'ajout au panier :", error);
        signalerErreur(error, `${produit.nom} n’a pas pu être ajouté. Réessayez.`);
        return false;
      }
      confirmerAjout(produit);
      return true;
    }

    const article = creerArticleInvite(Date.now(), produit, optionItemIds, choixFormule);
    mettreAJourInvite((prev) => regrouperArticlesIdentiques([...prev, article]));
    confirmerAjout(produit);
    return true;
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
        signalerErreur(error, 'La quantité n’a pas pu être modifiée.');
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
        signalerErreur(error, 'La modification n’a pas pu être enregistrée.');
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
        signalerErreur(error, 'La quantité n’a pas pu être modifiée.');
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
        signalerErreur(error, 'Le produit n’a pas pu être retiré.');
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
        signalerErreur(error, 'Le panier n’a pas pu être vidé.');
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
        message,
        ajouterAuPanier,
        incrementerQuantite,
        modifierItemPanier,
        retirerDuPanier,
        supprimerDuPanier,
        viderPanier,
        totalArticles,
        totalPrix,
        nombreAjouts,
        ouvertureDemandee,
        demanderOuverturePanier,
        consommerOuverturePanier,
      }}
    >
      {children}
    </ContextePanier.Provider>
  );
};