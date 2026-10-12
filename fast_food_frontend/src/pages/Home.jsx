import { useContext, useState } from 'react';
import { ContextePanier } from '../context/ContextePanier';
import { useCarte } from '../hooks/useCarte';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { estPersonnalisable, trouverProduit, produitsDeCategorie } from '../lib/produit';
import { PanierSidebarDesktop } from '../components/PanierSidebarDesktop';
import { PanierMobileSheet } from '../components/PanierMobileSheet';
import { HeroBanner } from '../components/carte/HeroBanner';
import { FiltresCategories } from '../components/carte/FiltresCategories';
import { SectionCategorie } from '../components/carte/SectionCategorie';
import { ModalPersonnalisation } from '../components/modales/ModalPersonnalisation';

export const Home = () => {
  const { ajouterAuPanier, modifierItemPanier } = useContext(ContextePanier);
  const { categories, produits, chargement } = useCarte();
  const estDesktop = useIsDesktop();

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
      modifierItemPanier(itemEnModification.id, options, choixFormule);
    } else {
      ajouterAuPanier(produit, options, choixFormule);
    }
    fermerModal();
  };

  if (chargement) {
    return <div className="py-12 text-center text-gray-500">Chargement de la carte...</div>;
  }

  // Categories a afficher, avec leurs produits. Les categories vides sont ignorees.
  const sections = categories
    .filter((cat) => categorieActive === null || cat.id === categorieActive)
    .map((cat) => ({ categorie: cat, produits: produitsDeCategorie(produits, cat.id) }))
    .filter((section) => section.produits.length > 0);

  return (
    <div className="flex items-start gap-8">
      <div className="min-w-0 flex-1 space-y-8">
        <HeroBanner />

        <FiltresCategories
          categories={categories}
          categorieActive={categorieActive}
          onChange={setCategorieActive}
        />

        <div className="space-y-10">
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

      {estDesktop ? (
        <PanierSidebarDesktop onEditItem={modifierItem} />
      ) : (
        <PanierMobileSheet onEditItem={modifierItem} />
      )}

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