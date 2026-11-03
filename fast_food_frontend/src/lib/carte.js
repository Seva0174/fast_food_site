import { manqueEmplacement } from './formule';
import { aTropPeuDOptions } from './options';
import { estAffichable, produitsDeCategorie } from './produit';

// Règles de la gestion de la carte en administration (fonctions pures).

// Les produits de la catégorie "Menus" sont des formules (menus composés de plusieurs produits).
const NOMS_CATEGORIE_MENU = ['menu', 'menus'];

export const FORMULAIRE_PRODUIT_VIDE = {
  nom: '',
  description: '',
  prix: '',
  imageUrl: '',
  idCategorie: '',
  // Hors vente à la création : le produit est mis en vente une fois complet
  estDispo: false,
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
  prix: Number(produit.prix).toFixed(2),
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

// Ingrédient en cours de choix dans l'éditeur de recette (pas encore ajouté).
export const SAISIE_INGREDIENT_VIDE = { idMatiere: '', quantite: '1', erreur: '' };

// Renvoie le message d'erreur d'un ingrédient invalide, ou null s'il est valide.
export const erreurIngredient = (matiere, quantite) => {
  if (!matiere) return 'Choisissez un ingrédient du stock.';
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

// Produits regroupés par catégorie, sans les catégories vides : [{ categorie, produits }].
export const produitsParCategorie = (categories, produits) =>
  categories
    .map((categorie) => ({ categorie, produits: produitsDeCategorie(produits, categorie.id) }))
    .filter((groupe) => groupe.produits.length > 0);
// Erreurs de saisie d'un produit, champ par champ ({ nom, prix, idCategorie }), ou null si tout est valide.
export const erreursProduit = ({ nom, prix, idCategorie }) => {
  const erreurs = {};
  if (!nom) erreurs.nom = 'Donnez un nom au produit.';
  if (Number.isNaN(prix)) erreurs.prix = 'Indiquez un prix (ex. 8,50).';
  else if (prix < 0) erreurs.prix = 'Le prix ne peut pas être négatif.';
  if (Number.isNaN(idCategorie)) erreurs.idCategorie = 'Choisissez une catégorie.';
  return Object.keys(erreurs).length > 0 ? erreurs : null;
};

const pluriel = (nombre, singulier, plurielMot = `${singulier}s`) =>
  `${nombre} ${nombre > 1 ? plurielMot : singulier}`;

// Résumé de la configuration d'un produit dans le tableau, en parties : ["2 groupes d'options", "sans recette"].
export const resumeConfiguration = (produit) => {
  if (produit.estFormule) {
    const nombre = produit.groupesFormule?.length ?? 0;
    return [nombre === 0 ? 'Aucun emplacement' : pluriel(nombre, 'emplacement')];
  }
  // Seuls les groupes qui ont des options sont proposés au client ; les groupes vides sont signalés à part
  const groupes = produit.groupesOptions ?? [];
  const visibles = groupes.filter((g) => g.options?.length > 0).length;
  const vides = groupes.length - visibles;
  const ingredients = produit.recette?.length ?? 0;
  return [
    `${visibles === 0 ? 'Sans option' : pluriel(visibles, "groupe d'options", "groupes d'options")}${
      vides > 0 ? ` (+${vides} vide${vides > 1 ? 's' : ''})` : ''
    }`,
    ingredients === 0 ? 'sans recette' : pluriel(ingredients, 'ingrédient'),
  ];
};

// Statut d'un produit. Deux questions distinctes :
// - la décision de l'admin : en vente ou hors vente (l'interrupteur) ;
// - ce que voit le client quand le produit est en vente : commandable, non commandable ou masqué.
export const STATUT_PRODUIT = {
  EN_VENTE: 'en_vente',
  HORS_VENTE: 'hors_vente',
  // En vente, mais sa configuration empêche de le commander (menu incomplet, choix impossible)
  BLOQUE: 'bloque',
  // En vente, mais sans photo ni description : la carte client ne l'affiche pas
  MASQUE: 'masque',
};

// Ce que voit le client (badge du tableau)
const LIBELLES_STATUT = {
  en_vente: 'En vente',
  hors_vente: 'Hors vente',
  bloque: 'Non commandable',
  masque: 'Masqué',
};

export const libelleStatut = (statut) => LIBELLES_STATUT[statut];

// Raison pour laquelle un produit en vente ne peut pas être commandé, ou null.
// Un groupe sans option est ignoré côté client (voir preparerCarte) : il ne bloque rien.
export const raisonBlocage = (produit) => {
  if (produit.estFormule) {
    const emplacements = produit.groupesFormule ?? [];
    if (emplacements.length === 0) return 'Aucun emplacement : le menu ne peut pas être composé.';
    const incomplet = emplacements.find((e) => manqueEmplacement(e));
    if (incomplet) return `« ${incomplet.nom} » : ${manqueEmplacement(incomplet).toLowerCase()}.`;
    return produit.formuleRealisable === false ? 'Un emplacement ne peut pas être rempli.' : null;
  }
  const groupe = (produit.groupesOptions ?? []).find((g) => aTropPeuDOptions({ ...g, options: g.options ?? [] }));
  return groupe
    ? `« ${groupe.nom} » demande ${groupe.minSelection} choix pour ${pluriel(groupe.options.length, 'option')}.`
    : null;
};

// { statut, raison } d'un produit : ce que voit le client, et pourquoi.
export const statutProduit = (produit) => {
  if (!produit.estDispo) return { statut: STATUT_PRODUIT.HORS_VENTE, raison: null };
  const raison = raisonBlocage(produit);
  if (raison) return { statut: STATUT_PRODUIT.BLOQUE, raison };
  if (!estAffichable(produit)) {
    return { statut: STATUT_PRODUIT.MASQUE, raison: 'Sans photo ni description : masqué sur la carte client.' };
  }
  return { statut: STATUT_PRODUIT.EN_VENTE, raison: null };
};

// Un produit peut-il être mis en vente ? Non s'il ne serait pas achetable (menu incomplet, choix impossible)
// ou invisible (ni photo ni description) : on refuse, avec la raison, plutôt que de le constater après coup.
// { ok: true } ou { ok: false, raison }.
export const verifierMiseEnVente = (produit) => {
  const { statut, raison } = statutProduit({ ...produit, estDispo: true });
  return statut === STATUT_PRODUIT.EN_VENTE ? { ok: true } : { ok: false, raison };
};

// Images dont l'adresse n'a pas pu être chargée : { [idProduit]: adresse en échec }, relevé par le tableau.
export const imageCassee = (produit, echecsImages = {}) =>
  Boolean(produit.imageUrl) && echecsImages[produit.id] === produit.imageUrl;

// Filtre « état » de la carte : null (tous), 'a_corriger' (en vente mais pas achetable : non commandable,
// masqué ou image introuvable) ou 'hors_vente' (retiré de la vente par l'admin).
export const ETAT_FILTRE = { A_CORRIGER: 'a_corriger', HORS_VENTE: 'hors_vente' };

const correspondEtat = (produit, etat, echecsImages) => {
  if (etat === null) return true;
  const { statut } = statutProduit(produit);
  if (etat === ETAT_FILTRE.HORS_VENTE) return statut === STATUT_PRODUIT.HORS_VENTE;
  if (statut === STATUT_PRODUIT.HORS_VENTE) return false;
  return statut !== STATUT_PRODUIT.EN_VENTE || imageCassee(produit, echecsImages);
};

// Nombre de produits par état : { a_corriger, hors_vente }.
export const compterEtats = (produits, echecsImages) => ({
  [ETAT_FILTRE.A_CORRIGER]: produits.filter((p) => correspondEtat(p, ETAT_FILTRE.A_CORRIGER, echecsImages)).length,
  [ETAT_FILTRE.HORS_VENTE]: produits.filter((p) => correspondEtat(p, ETAT_FILTRE.HORS_VENTE, echecsImages)).length,
});

// Les filtres actifs en clair, pour dire pourquoi la liste est vide : « recherche « tacos », catégorie Menus ».
export const decrireFiltres = ({ recherche, idCategorie, etat }, categories) => {
  const parties = [];
  if (recherche.trim()) parties.push(`recherche « ${recherche.trim()} »`);
  if (idCategorie !== null) parties.push(`catégorie ${categories.find((c) => c.id === idCategorie)?.nom ?? ''}`.trim());
  if (etat === ETAT_FILTRE.A_CORRIGER) parties.push('état « À corriger »');
  if (etat === ETAT_FILTRE.HORS_VENTE) parties.push('état « Hors vente »');
  return parties.join(', ');
};

const normaliser = (texte) =>
  (texte ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const FILTRES_CARTE_VIDES = { recherche: '', idCategorie: null, etat: null };

export const aDesFiltres = ({ recherche, idCategorie, etat }) =>
  Boolean(recherche.trim()) || idCategorie !== null || etat !== null;

// Filtre de la carte : recherche sur le nom, la description et la catégorie (sans tenir compte des accents),
// catégorie (null = toutes) et état (voir ETAT_FILTRE).
export const filtrerProduits = (produits, { recherche = '', idCategorie = null, etat = null }, echecsImages) => {
  const termes = normaliser(recherche.trim());
  return produits.filter(
    (p) =>
      (idCategorie === null || p.categorie?.id === idCategorie) &&
      correspondEtat(p, etat, echecsImages) &&
      (!termes || normaliser(`${p.nom} ${p.description} ${p.categorie?.nom}`).includes(termes))
  );
};

// Tri du tableau : { colonne: 'nom' | 'prix' | 'statut', sens: 'asc' | 'desc' }, ou null (ordre de la base).
// Par statut, l'ordre croissant met d'abord ce qui demande une action.
const RANG_STATUT = { bloque: 0, masque: 1, hors_vente: 2, en_vente: 3 };

const COMPARATEURS = {
  nom: (a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }),
  prix: (a, b) => Number(a.prix) - Number(b.prix),
  statut: (a, b) => RANG_STATUT[statutProduit(a).statut] - RANG_STATUT[statutProduit(b).statut],
};

export const trierProduits = (produits, tri) => {
  if (!tri) return produits;
  const signe = tri.sens === 'desc' ? -1 : 1;
  return [...produits].sort((a, b) => signe * COMPARATEURS[tri.colonne](a, b) || COMPARATEURS.nom(a, b));
};

// Clic sur un en-tête : croissant, puis décroissant, puis retour à l'ordre de la base.
export const triSuivant = (tri, colonne) => {
  if (tri?.colonne !== colonne) return { colonne, sens: 'asc' };
  return tri.sens === 'asc' ? { colonne, sens: 'desc' } : null;
};

// Unités écrites en abrégé : elles restent invariables (« 2 kg », mais « 2 tranches »).
const UNITES_ABREGEES = ['kg', 'g', 'mg', 'l', 'cl', 'ml'];

const accorderUnite = (quantite, unite) =>
  quantite >= 2 && !UNITES_ABREGEES.includes(unite.toLowerCase()) && !/[sx]$/i.test(unite)
    ? `${unite}s`
    : unite;

// Quantité lisible : « 0,15 kg », « 2 tranches » ; « — » si elle manque.
export const formaterQuantite = (quantite, unite) => {
  const nombre = Number(quantite);
  if (quantite === null || quantite === undefined || Number.isNaN(nombre)) return '—';
  const texte = nombre.toLocaleString('fr-FR', { maximumFractionDigits: 3 });
  return unite ? `${texte} ${accorderUnite(nombre, unite)}` : texte;
};
