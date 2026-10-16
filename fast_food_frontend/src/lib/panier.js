// Fonctions pures du panier : conversion des reponses de l'API et operations sur le panier invite.
// Aucune dependance a React ni au navigateur, pour pouvoir les tester facilement.
import { detaillerOptions } from './options';

// Produit choisi dans un menu, tel que renvoye par l'API.
export const mapComposant = (composant) => ({
  id: composant.id,
  idGroupe: composant.idGroupe,
  nomGroupe: composant.nomGroupe,
  produitId: composant.produitId,
  nom: composant.nomProduit,
  options: composant.options ?? [],
  supplement: Number(composant.surcoutEmplacement ?? 0),
});

// Convertit la reponse de l'API (PanierResponse) en liste d'articles affichables.
export const mapPanierResponse = (panierResponse) => {
  if (!panierResponse?.items) return [];

  return panierResponse.items.map((item) => {
    const composants = (item.composants ?? []).map(mapComposant);

    return {
      id: item.id,
      produitId: item.produitId,
      nom: item.nomProduit,
      prix: Number(item.prixUnitaire ?? 0),
      quantite: item.quantite,
      options: item.options ?? [],
      composants,
      estFormule: composants.length > 0,
    };
  });
};

// Convertit un choix de menu (panier invite) en composant affichable.
export const composantDepuisChoix = (choix) => ({
  id: `${choix.idGroupe}-${choix.idProduit}`,
  idGroupe: choix.idGroupe,
  nomGroupe: choix.nomGroupe,
  produitId: choix.idProduit,
  nom: choix.nomProduit,
  options: choix.optionsDetails ?? [],
  supplement: Number(choix.supplement ?? 0),
});

export const additionnerSupplements = (choixFormule = []) =>
  choixFormule.reduce((total, choix) => total + Number(choix.supplement ?? 0), 0);

const additionnerSurcoutsOptions = (options = []) =>
  options.reduce((total, option) => total + Number(option.surcout ?? 0), 0);

// Empreinte d'un article : deux articles avec la meme empreinte sont identiques.
// Les listes sont triees pour que l'ordre de selection n'ait pas d'importance.
export const cleArticle = ({ produitId, optionItemIds = [], choixFormule = [] }) =>
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

// Partie de l'article qui depend des choix du client, partagee entre creation et modification.
// Le prix inclut le prix de base, les surcoûts des options et les suppléments du menu,
// comme le fait le backend dans prixUnitaire.
const compositionArticle = (prixBase, optionItemIds = [], options = [], choixFormule = []) => ({
  prixBase,
  prix: prixBase + additionnerSurcoutsOptions(options) + additionnerSupplements(choixFormule),
  optionItemIds,
  options,
  choixFormule,
  composants: choixFormule.map(composantDepuisChoix),
});

// L'identifiant est fourni par l'appelant pour que la fonction reste pure.
export const creerArticleInvite = (id, produit, optionItemIds = [], choixFormule = []) => ({
  id,
  produitId: produit.id,
  nom: produit.nom,
  quantite: 1,
  estFormule: produit.estFormule,
  ...compositionArticle(
    Number(produit.prix ?? 0),
    optionItemIds,
    detaillerOptions(produit.groupesOptions ?? [], optionItemIds),
    choixFormule
  ),
});

// Le produit est necessaire pour retrouver les noms et surcoûts des options choisies.
export const modifierArticleInvite = (article, produit, optionItemIds = [], choixFormule = []) => ({
  ...article,
  ...compositionArticle(
    Number(produit.prix ?? 0),
    optionItemIds,
    detaillerOptions(produit.groupesOptions ?? [], optionItemIds),
    choixFormule
  ),
});

// Regroupe les articles identiques : le premier est conserve, les quantites sont additionnees.
export const regrouperArticlesIdentiques = (articles) =>
  articles.reduce((resultat, article) => {
    const cle = cleArticle(article);
    const existant = resultat.find((a) => cleArticle(a) === cle);

    if (!existant) return [...resultat, article];

    return resultat.map((a) =>
      a.id === existant.id ? { ...a, quantite: a.quantite + article.quantite } : a
    );
  }, []);

export const changerQuantiteArticle = (articles, idArticle, quantite) =>
  articles.map((article) => (article.id === idArticle ? { ...article, quantite } : article));

export const supprimerArticle = (articles, idArticle) =>
  articles.filter((article) => article.id !== idArticle);