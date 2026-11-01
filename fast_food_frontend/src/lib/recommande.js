import { construireChoixFormule, groupesFormuleDe } from './formule';
import { groupesNonValides } from './options';
import { estDisponible } from './produit';

// Une commande passee ne garde pas les identifiants des options ni des emplacements de menu
// (seulement leurs noms) : ils sont retrouves par leur nom dans la carte actuelle.
// Un article introuvable ou indisponible est ignore (il sera signale au client).

const trouverProduit = (produits, id) => produits.find((p) => p.id === id);

// Identifiants des options d'un produit a partir de leurs noms ; null si une option a disparu.
const retrouverOptions = (produit, optionsCommande = []) => {
  const disponibles = (produit?.groupesOptions ?? []).flatMap((g) => g.options);
  const ids = [];
  for (const option of optionsCommande) {
    const item = disponibles.find((o) => o.nom === option.nomOption);
    if (!item) return null;
    ids.push(item.id);
  }
  return ids;
};

// Choix d'un menu (format ContextePanier) a partir de ses composants ; null si impossible.
const retrouverChoixMenu = (formule, composants, produits) => {
  const groupes = groupesFormuleDe(formule);
  const selections = {};

  for (const composant of composants) {
    const groupe = groupes.find((g) => g.nom === composant.nomGroupe);
    const lien = groupe?.produits.find((l) => l.idProduit === composant.produitId);
    if (!groupe || !lien || !lien.estDispo) return null;

    const optionIds = retrouverOptions(trouverProduit(produits, composant.produitId), composant.options);
    if (!optionIds) return null;
    selections[groupe.id] = [...(selections[groupe.id] ?? []), { idProduit: composant.produitId, optionIds }];
  }

  // Chaque emplacement obligatoire doit etre rempli
  const incomplet = groupes.some((g) => (selections[g.id]?.length ?? 0) < g.minSelection);
  return incomplet ? null : construireChoixFormule(groupes, selections, produits);
};

// Prepare une nouvelle commande identique a une commande passee.
// Renvoie { articles: [{ produit, quantite, optionIds, choixFormule }], indisponibles: [noms],
//           idsIndisponibles: [id des lignes de commande non reprises], total: nombre de lignes }.
export const preparerRecommande = (commande, produits) => {
  const articles = [];
  const indisponibles = [];
  const idsIndisponibles = [];
  const refuser = (item) => {
    indisponibles.push(item.nomProduit);
    idsIndisponibles.push(item.id);
  };

  for (const item of commande.items) {
    const produit = trouverProduit(produits, item.produitId);
    if (!produit || !estDisponible(produit)) {
      refuser(item);
      continue;
    }

    if (produit.estFormule) {
      const choixFormule = retrouverChoixMenu(produit, item.composants, produits);
      if (choixFormule) articles.push({ produit, quantite: item.quantite, optionIds: [], choixFormule });
      else refuser(item);
      continue;
    }

    const optionIds = retrouverOptions(produit, item.options);
    if (optionIds && groupesNonValides(produit.groupesOptions ?? [], optionIds).length === 0) {
      articles.push({ produit, quantite: item.quantite, optionIds, choixFormule: [] });
    } else {
      refuser(item);
    }
  }

  return { articles, indisponibles, idsIndisponibles, total: commande.items.length };
};

// Libelle du bouton : il annonce avant le clic ce qui sera vraiment repris.
export const libelleRecommande = ({ articles, total }) => {
  if (articles.length === 0) return 'Plus aucun article disponible';
  if (articles.length === total) return 'Recommander les mêmes articles';
  return `Recommander ${articles.length} article${articles.length > 1 ? 's' : ''} sur ${total}`;
};
