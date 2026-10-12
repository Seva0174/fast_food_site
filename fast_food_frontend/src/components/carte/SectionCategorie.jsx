import { ProductCard } from '../produits/ProductCard';

export const SectionCategorie = ({ categorie, produits, onOpenModal }) => (
  <section className="space-y-4">
    <h2 className="border-b pb-2 text-2xl font-bold text-gray-800">{categorie.nom}</h2>

    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {produits.map((produit) => (
        <ProductCard key={produit.id} produit={produit} onOpenModal={onOpenModal} />
      ))}
    </div>
  </section>
);