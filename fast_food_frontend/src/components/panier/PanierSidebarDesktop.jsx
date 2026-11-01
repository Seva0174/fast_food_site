import { useContext } from 'react';
import { ContextePanier } from '../../context/ContextePanier';
import { PanierContent } from './PanierContent';

// Panier lateral (PC). Vide, il se reduit a un encart compact ;
// il prend la hauteur de l'ecran des le premier article.
export const PanierSidebarDesktop = ({ onEditItem }) => {
  const { panier } = useContext(ContextePanier);
  const hauteur = panier.length > 0 ? 'h-[calc(100vh-6rem)]' : 'h-auto';

  return (
    // id "panier" + tabIndex : cible du lien d'evitement et du lien "Panier" de la navbar
    <aside
      id="panier"
      tabIndex={-1}
      aria-label="Mon panier"
      className={`sticky top-20 mt-3 flex ${hauteur} w-80 shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card`}
    >
      <PanierContent onEditItem={onEditItem} />
    </aside>
  );
};
