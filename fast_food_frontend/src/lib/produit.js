// Un menu n'est vendable que si chacun de ses emplacements a encore un produit disponible.
export const estDisponible = (produit) =>
  produit.estDispo && (!produit.estFormule || produit.formuleRealisable !== false);

export const aDesOptions = (produit) => produit.groupesOptions.length > 0;

// Indique si un article du panier peut etre modifie (composition ou options).
export const peutEtreModifie = (item) => item.estFormule || item.options.length > 0

export const trouverProduit = (produits, id) => produits.find((p) => p.id === id);

export const produitsDeCategorie = (produits, idCategorie) =>
  produits.filter((p) => p.categorie?.id === idCategorie);

export const estPersonnalisable = (produit) => produit.estFormule || aDesOptions(produit)