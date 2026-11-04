import { useContext, useEffect, useState } from 'react';
import { ContextePanier } from '../context/ContextePanier';
import { useCarte } from '../hooks/useCarte';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { useSectionActive } from '../hooks/useSectionActive';
import { defilerVers, idSectionCategorie } from '../lib/defilement';
import { estPersonnalisable, trouverProduit, produitsDeCategorie } from '../lib/produit';
import { PanierSidebarDesktop } from '../components/panier/PanierSidebarDesktop';
import { PanierMobileSheet } from '../components/panier/PanierMobileSheet';
import { HeroBanner } from '../components/carte/HeroBanner';
import { FiltresCategories } from '../components/carte/FiltresCategories';
import { SectionCategorie } from '../components/carte/SectionCategorie';
import { ModalPersonnalisation } from '../components/modales/ModalPersonnalisation';
import { CarteEnChargement, CarteEnErreur } from '../components/carte/EtatCarte';
import { useTitrePage } from '@/hooks/useTitrePage';

// Defilement jusqu'a la barre des categories (id "carte", voir FiltresCategories)
const allerALaCarte = () => defilerVers(document.getElementById('carte'));

export const Home = () => {
  useTitrePage();
  const {
    ajouterAuPanier,
    modifierItemPanier,
    ouvertureDemandee,
    consommerOuverturePanier,
  } = useContext(ContextePanier);
  const { categories, produits, chargement, erreur, charger } = useCarte();
  const estDesktop = useIsDesktop();

  const [produitEnCours, setProduitEnCours] = useState(null);
  const [itemEnModification, setItemEnModification] = useState(null);
  const [panierMobileOuvert, setPanierMobileOuvert] = useState(false);
  // Modification lancee depuis le tiroir mobile : il se rouvre quand la modale se ferme
  const [rouvrirTiroir, setRouvrirTiroir] = useState(false);

  // Lien "Panier" de la navbar : sur PC, la page defile jusqu'a la carte et au panier lateral ;
  // sur mobile, la demande ouvre directement le tiroir (voir tiroirOuvert).
  useEffect(() => {
    if (!ouvertureDemandee || chargement || !estDesktop) return;
    consommerOuverturePanier();
    allerALaCarte();
    // Le focus suit : un utilisateur au clavier arrive directement dans le panier
    document.getElementById('panier')?.focus({ preventScroll: true });
  }, [ouvertureDemandee, chargement, consommerOuverturePanier, estDesktop]);

  const tiroirOuvert = panierMobileOuvert || ouvertureDemandee;
  const changerTiroir = (ouvert) => {
    setPanierMobileOuvert(ouvert);
    if (!ouvert) consommerOuverturePanier();
  };

  const ouvrirModal = (produit, item = null) => {
    setProduitEnCours(produit);
    setItemEnModification(item);
  };

  const fermerModal = () => {
    setProduitEnCours(null);
    setItemEnModification(null);
    if (rouvrirTiroir) {
      setRouvrirTiroir(false);
      setPanierMobileOuvert(true);
    }
  };

  // Ouvre la modale seulement si le produit peut etre personnalise
  const modifierItem = (item) => {
    const produit = trouverProduit(produits, item.produitId);
    if (produit && (produit.estFormule || estPersonnalisable(produit))) {
      // Une seule fenetre a la fois : le tiroir du panier se ferme pendant la modification
      if (tiroirOuvert) setRouvrirTiroir(true);
      changerTiroir(false);
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

  // Toute la carte est affichee, categorie par categorie. Les categories vides sont ignorees.
  const sections = categories
    .map((cat) => ({ categorie: cat, produits: produitsDeCategorie(produits, cat.id) }))
    .filter((section) => section.produits.length > 0);

  const { active: sectionActive, allerA } = useSectionActive(
    sections.map(({ categorie }) => idSectionCategorie(categorie.id))
  );


  return (
    <div>
      <HeroBanner onCommander={allerALaCarte} />

      <div className="mx-auto flex max-w-7xl items-start gap-8 px-4 pb-10 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          {chargement && <CarteEnChargement />}

          {!chargement && erreur && <CarteEnErreur message={erreur} onReessayer={charger} />}

          {!chargement && !erreur && (
            <>
              {estDesktop && (
                <a
                  href="#panier"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('panier')?.focus();
                  }}
                  className="sr-only focus:not-sr-only focus:absolute focus:z-40 focus:mt-2 focus:rounded-lg focus:bg-card focus:px-4 focus:py-3 focus:font-semibold"
                >
                  Aller au panier
                </a>
              )}

              <FiltresCategories
                categories={sections.map(({ categorie }) => categorie)}
                sectionActive={sectionActive}
                onChoisir={allerA}
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
            </>
          )}
        </div>

        {estDesktop && <PanierSidebarDesktop onEditItem={modifierItem} />}
      </div>

      {!estDesktop && (
        <PanierMobileSheet
          ouvert={tiroirOuvert}
          onChangerOuvert={changerTiroir}
          onEditItem={modifierItem}
        />
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