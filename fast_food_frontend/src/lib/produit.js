// Normalise un produit reçu de l'API (camelCase ou snake_case).
// A supprimer une fois que menuApi.js renvoie directement le format camelCase.
export const normaliserProduit = (produit) => ({
  ...produit,
  estFormule: produit.estFormule ?? produit.est_formule ?? false,
  estDispo: produit.estDispo ?? produit.est_dispo ?? true,
  imageUrl: produit.imageUrl ?? produit.image_url ?? null,
  idCategorie: produit.idCategorie ?? produit.id_categorie ?? produit.categorie?.id ?? null,
  groupesOptions: produit.groupesOptions ?? produit.groupes_options ?? [],
});

// Un menu n'est vendable que si chacun de ses emplacements a encore un produit disponible.
export const estDisponible = (produit) =>
  produit.estDispo && (!produit.estFormule || produit.formuleRealisable !== false);

export const aDesOptions = (produit) => produit.groupesOptions.length > 0;

// Indique si un article du panier peut etre modifie (composition ou options).
export const peutEtreModifie = (item) =>
  Boolean(
    item.estFormule ||
      item.options?.length > 0 ||
      item.groupesOptions?.length > 0 ||
      item.estPersonnalisable
  );

export const trouverProduit = (produits, id) => produits.find((p) => p.id === id);

export const produitsDeCategorie = (produits, idCategorie) =>
  produits.filter((p) => p.categorie?.id === idCategorie);