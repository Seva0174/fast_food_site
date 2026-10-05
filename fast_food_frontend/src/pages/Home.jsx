import { useState, useEffect, useContext } from 'react';
import { getCategories, getProduits } from '../api/menuApi';
import { ProductCard } from '../components/ProductCard';
import { PanierSidebarDesktop } from '../components/PanierSidebarDesktop';
import { PanierMobileSheet } from '../components/PanierMobileSheet';
import { ProductOptionModal } from '../components/ProductOptionModal';
import { ContextePanier } from '../context/ContextePanier';

export const Home = () => {
  const { ajouterAuPanier, modifierItemPanier } = useContext(ContextePanier);
  const [categories, setCategories] = useState([]);
  const [produits, setProduits] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalProduit, setModalProduit] = useState(null);
  const [itemEnCoursDeModification, setItemEnCoursDeModification] = useState(null);

  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  const handleModifierItem = (itemPanier) => {
    // Retrouver le produit complet à partir du catalogue
    const produitComplet = produits.find(
      (p) => p.id === (itemPanier.produitId || itemPanier.id)
    );

    const groupes = produitComplet?.groupesOptions || produitComplet?.groupes_options || [];

    // On n'ouvre la modale que si le produit possède des groupes d'options
    if (produitComplet && groupes.length > 0) {
      setItemEnCoursDeModification(itemPanier);
      setModalProduit(produitComplet);
    }
  };

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catData, prodData] = await Promise.all([
          getCategories(),
          getProduits()
        ]);
        setCategories(catData);
        setProduits(prodData);
      } catch (error) {
        console.error("Erreur lors du chargement de la carte:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Chargement de la carte...</div>;
  }

  return (
    <div className="flex gap-8 items-start">
      <div className="flex-1 space-y-8 min-w-0">
        <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-2xl p-6 sm:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Des Burgers Savoureux, Livrés chez vous !
            </h1>
            <p className="mt-3 text-red-100 text-lg">
              Commandez en quelques clics et faites-vous livrer directement à domicile.
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
              selectedCategory === null
                ? 'bg-red-600 text-white shadow'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Tous les produits
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-red-600 text-white shadow'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat.nom}
            </button>
          ))}
        </div>

        {/* Grille */}
        <div className="space-y-10">
          {categories
            .filter((cat) => selectedCategory === null || cat.id === selectedCategory)
            .map((cat) => {
              const produitsDeLaCategorie = produits.filter((p) => {
                const catId = p.categorie?.id || p.idCategorie || p.id_categorie;
                return catId === cat.id;
              });

              if (produitsDeLaCategorie.length === 0) return null;

              return (
                <section key={cat.id} className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
                    {cat.nom}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {produitsDeLaCategorie.map((produit) => (
                      <ProductCard 
                        key={produit.id} 
                        produit={produit} 
                        onOpenModal={(p) => setModalProduit(p)} 
                      />
                    ))}
                  </div>
                </section>
              );
            })}
        </div>
      </div>

      {isDesktop ? (
        <PanierSidebarDesktop onEditItem={handleModifierItem} />
      ) : (
        <PanierMobileSheet onEditItem={handleModifierItem} />
      )}

      {/* Modal de personnalisation positionnée globalement */}
      <ProductOptionModal
        key={modalProduit?.id || 'modal-fermee'}
        produit={modalProduit}
        itemPanier={itemEnCoursDeModification}
        isOpen={!!modalProduit}
        onClose={() => {
          setModalProduit(null);
          setItemEnCoursDeModification(null);
        }}
        onConfirm={(produit, options) => {
          if (itemEnCoursDeModification) {
            modifierItemPanier(itemEnCoursDeModification.id, options);
          } else {
            ajouterAuPanier(produit, options);
          }
          setModalProduit(null);
          setItemEnCoursDeModification(null);
        }}
      />
    </div>
  );
};