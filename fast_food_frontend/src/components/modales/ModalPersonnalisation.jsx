import { FormuleCompositionModal } from '../modales/FormuleCompositionModal';
import { ProductOptionModal } from '../modales/ProductOptionModal';

// Affiche la modale adaptee au produit. Les deux modales restent montees
// pour que leur fermeture (isOpen) soit gerée par leur propre composant.
export const ModalPersonnalisation = ({ produit, produits, itemPanier, onClose, onConfirm }) => {
  if (produit?.estFormule) {
    return (
      <FormuleCompositionModal
        key={`formule-${produit.id}-${itemPanier?.id ?? 'nouveau'}`}
        formule={produit}
        produits={produits}
        itemPanier={itemPanier}
        isOpen={!!produit}
        onClose={onClose}
        onConfirm={(formule, choixFormule) => onConfirm(formule, [], choixFormule)}
      />
    );
  }

  return (
    <ProductOptionModal
      key={produit?.id ?? 'modal-fermee'}
      produit={produit}
      itemPanier={itemPanier}
      isOpen={!!produit}
      onClose={onClose}
      onConfirm={(p, options) => onConfirm(p, options, [])}
    />
  );
};