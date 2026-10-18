import { produitsDeCategorie } from './produit';

// Règles de la gestion de la carte en administration (fonctions pures).

// Les produits de la catégorie "Menus" sont des formules (menus composés de plusieurs produits).
const NOMS_CATEGORIE_MENU = ['menu', 'menus'];

export const FORMULAIRE_PRODUIT_VIDE = {
  nom: '',
  description: '',
  prix: '',
  imageUrl: '',
  idCategorie: '',
  estDispo: true,
};

export const estCategorieMenu = (categories, idCategorie) => {
  const categorie = categories.find((c) => String(c.id) === String(idCategorie));
  return NOMS_CATEGORIE_MENU.includes((categorie?.nom ?? '').trim().toLowerCase());
};

// Un produit est un menu quand il appartient à la catégorie Menus.
// En modification, la nature du produit est conservée : elle ne peut plus changer.
export const estProduitFormule = (categories, produitEnEdition, idCategorie) =>
  produitEnEdition ? produitEnEdition.estFormule : estCategorieMenu(categories, idCategorie);

// En modification, un produit ne peut pas passer dans ou hors de la catégorie Menus.
export const categoriesProposees = (categories, produitEnEdition, idCategorieChoisie) => {
  if (!produitEnEdition) return categories;
  return categories.filter(
    (categorie) =>
      estCategorieMenu(categories, categorie.id) === produitEnEdition.estFormule ||
      String(categorie.id) === String(idCategorieChoisie)
  );
};

// Première catégorie qui n'est pas celle des menus (sinon la première de la liste).
export const categorieParDefaut = (categories) =>
  (categories.find((c) => !estCategorieMenu(categories, c.id)) ?? categories[0])?.id ?? '';

export const formulaireDepuisProduit = (produit) => ({
  nom: produit.nom,
  description: produit.description ?? '',
  prix: produit.prix,
  imageUrl: produit.imageUrl ?? '',
  idCategorie: produit.categorie.id,
  estDispo: produit.estDispo,
});

export const recetteDepuisProduit = (produit) =>
  produit.recette.map(({ idMatiere, nomMatiere, quantiteRequise, uniteMesure }) => ({
    idMatiere,
    nomMatiere,
    quantiteRequise,
    uniteMesure,
  }));

// Les quantités de la base ont 3 décimales : on évite les écarts de calcul flottant.
const arrondirQuantite = (valeur) => Math.round(valeur * 1000) / 1000;

// Ajoute un ingrédient à la recette ; une matière déjà présente voit sa quantité augmenter.
export const ajouterIngredient = (recette, matiere, quantite) =>
  recette.some((ingredient) => ingredient.idMatiere === matiere.id)
    ? recette.map((ingredient) =>
        ingredient.idMatiere === matiere.id
          ? { ...ingredient, quantiteRequise: arrondirQuantite(ingredient.quantiteRequise + quantite) }
          : ingredient
      )
    : [
        ...recette,
        {
          idMatiere: matiere.id,
          nomMatiere: matiere.nom,
          quantiteRequise: arrondirQuantite(quantite),
          uniteMesure: matiere.uniteMesure,
        },
      ];

export const retirerIngredient = (recette, idMatiere) =>
  recette.filter((ingredient) => ingredient.idMatiere !== idMatiere);

// Renvoie le message d'erreur d'un ingrédient invalide, ou null s'il est valide.
export const erreurIngredient = (matiere, quantite) => {
  if (!matiere) return 'Choisissez une matière première.';
  if (Number.isNaN(quantite) || quantite <= 0) return 'La quantité requise doit être supérieure à 0.';
  return null;
};

// Corps de la requête de création ou de modification d'un produit.
// Un menu n'a pas de recette : son stock est déduit à partir des produits choisis par le client.
export const construirePayloadProduit = (formulaire, estFormule, recette) => ({
  nom: formulaire.nom.trim(),
  description: formulaire.description.trim(),
  prix: parseFloat(formulaire.prix),
  imageUrl: formulaire.imageUrl.trim(),
  idCategorie: parseInt(formulaire.idCategorie, 10),
  estDispo: formulaire.estDispo,
  estFormule,
  recette: estFormule
    ? []
    : recette.map(({ idMatiere, quantiteRequise }) => ({ idMatiere, quantiteRequise })),
});

// Renvoie le message d'erreur d'un produit invalide, ou null s'il est valide.
export const erreurProduit = ({ nom, prix, idCategorie }) => {
  if (!nom) return 'Le nom du produit est obligatoire.';
  if (Number.isNaN(prix) || prix < 0) return 'Le prix doit être un nombre positif ou nul.';
  if (Number.isNaN(idCategorie)) return 'Veuillez sélectionner une catégorie.';
  return null;
};

// Produits regroupés par catégorie, sans les catégories vides : [{ categorie, produits }].
export const produitsParCategorie = (categories, produits) =>
  categories
    .map((categorie) => ({ categorie, produits: produitsDeCategorie(produits, categorie.id) }))
    .filter((groupe) => groupe.produits.length > 0);