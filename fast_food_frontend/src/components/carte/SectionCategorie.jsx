import { ProductCard } from '../produits/ProductCard';

// 2 colonnes sur mobile. Le panier lateral apparait a partir de lg,
// d'ou le retour a 2 colonnes entre lg et xl pour garder de grandes photos.
export const SectionCategorie = ({ categorie, produits, onOpenModal }) => (
  <section className="space-y-4">
    <h2 className="titre-marque border-b border-border pb-2 text-4xl">{categorie.nom}</h2>

    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
      {produits.map((produit) => (
        <ProductCard key={produit.id} produit={produit} onOpenModal={onOpenModal} />
      ))}
    </div>
  </section>
);