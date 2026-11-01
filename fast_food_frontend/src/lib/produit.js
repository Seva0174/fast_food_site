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

// Un produit sans photo ni description est un brouillon (ex : produit de test) : il reste hors de la carte.
const estAffichable = (produit) => Boolean(produit.imageUrl || produit.description?.trim());

// Retire les étapes de menu et les groupes d'options sans contenu, qui donneraient un écran vide.
const sansGroupesVides = (produit) => ({
  ...produit,
  groupesFormule: (produit.groupesFormule ?? []).filter((g) => g.produits?.length > 0),
  groupesOptions: (produit.groupesOptions ?? []).filter((g) => g.options?.length > 0),
});

// Carte telle qu'elle doit être montrée au client.
export const preparerCarte = (produits) => produits.filter(estAffichable).map(sansGroupesVides);
