import { useState, useEffect } from 'react';
import { getCategories, getProduits } from '../api/menuApi';
import { ProductCard } from '../components/ProductCard';

export const Home = () => {
  const [categories, setCategories] = useState([]);
  const [produits, setProduits] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const filteredProduits = selectedCategory
    ? produits.filter((p) => {
        const catId = p.idCategorie || p.categorie?.id || p.id_categorie;
        return catId === selectedCategory;
      })
    : produits;

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Chargement de la carte...</div>;
  }

  return (
    <div className="space-y-8">
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

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Notre Carte</h2>
        {filteredProduits.length === 0 ? (
          <p className="text-gray-500 italic">Aucun produit disponible dans cette catégorie.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProduits.map((produit) => (
              <ProductCard key={produit.id} produit={produit} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};