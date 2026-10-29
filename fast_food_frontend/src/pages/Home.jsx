import { useContext, useState } from 'react';
import { ContextePanier } from '../context/ContextePanier';
import { useCarte } from '../hooks/useCarte';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { useDiapositiveHero } from '../hooks/useDiapositiveHero';
import { estPersonnalisable, trouverProduit, produitsDeCategorie } from '../lib/produit';
import { PanierSidebarDesktop } from '../components/panier/PanierSidebarDesktop';
import { PanierMobileSheet } from '../components/panier/PanierMobileSheet';
import { HeroBanner } from '../components/carte/HeroBanner';
import { FiltresCategories } from '../components/carte/FiltresCategories';
import { SectionCategorie } from '../components/carte/SectionCategorie';
import { ModalPersonnalisation } from '../components/modales/ModalPersonnalisation';

export const Home = () => {
  const { ajouterAuPanier, modifierItemPanier, totalArticles } = useContext(ContextePanier);
  const { categories, produits, chargement } = useCarte();
  const estDesktop = useIsDesktop();
  const { refHero, descendre } = useDiapositiveHero(estDesktop && !chargement);

  const [categorieActive, setCategorieActive] = useState(null);
  const [produitEnCours, setProduitEnCours] = useState(null);
  const [itemEnModification, setItemEnModification] = useState(null);

  const ouvrirModal = (produit, item = null) => {
    setProduitEnCours(produit);
    setItemEnModification(item);
  };

  const fermerModal = () => {
    setProduitEnCours(null);
    setItemEnModification(null);
  };

  // Ouvre la modale seulement si le produit peut etre personnalise
  const modifierItem = (item) => {
    const produit = trouverProduit(produits, item.produitId);
    if (produit && (produit.estFormule || estPersonnalisable(produit))) {
      ouvrirModal(produit, item);
    }
  };

  const confirmer = (produit, options, choixFormule) => {
    if (itemEnModification) {
      modifierItemPanier(itemEnModification.id, produit, options, choixFormule);
    } else {
      ajouterAuPanier(produit, options, choixFormule);
    }
    fermerModal();
  };

  if (chargement) {
    return <div className="py-12 text-center text-muted-foreground">Chargement de la carte...</div>;
  }

  // Categories a afficher, avec leurs produits. Les categories vides sont ignorees.
  const sections = categories
    .filter((cat) => categorieActive === null || cat.id === categorieActive)
    .map((cat) => ({ categorie: cat, produits: produitsDeCategorie(produits, cat.id) }))
    .filter((section) => section.produits.length > 0);

  // Sur mobile, la barre fixe du panier ne doit pas masquer le bas de la carte
  const espaceBarrePanier = !estDesktop && totalArticles > 0 ? 'pb-24' : '';

  return (
    <div>
      <HeroBanner ref={refHero} onCommander={descendre} />

      <div className="mx-auto flex max-w-7xl items-start gap-8 px-4 pb-10 sm:px-6 lg:px-8">
        <div className={`min-w-0 flex-1 ${espaceBarrePanier}`}>
          <FiltresCategories
            categories={categories}
            categorieActive={categorieActive}
            onChange={setCategorieActive}
          />

          <div className="space-y-10 pt-6">
            {sections.map(({ categorie, produits: produitsSection }) => (
              <SectionCategorie
                key={categorie.id}
                categorie={categorie}
                produits={produitsSection}
                onOpenModal={ouvrirModal}
              />
            ))}
          </div>
        </div>

        {estDesktop && <PanierSidebarDesktop onEditItem={modifierItem} />}
      </div>

      {!estDesktop && <PanierMobileSheet onEditItem={modifierItem} />}

      <ModalPersonnalisation
        produit={produitEnCours}
        produits={produits}
        itemPanier={itemEnModification}
        onClose={fermerModal}
        onConfirm={confirmer}
      />
    </div>
  );
};