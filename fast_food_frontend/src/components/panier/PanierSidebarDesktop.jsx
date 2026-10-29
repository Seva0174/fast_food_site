import { PanierContent } from './PanierContent';
import { useApparition } from '../../hooks/useApparition';

// Le panier glisse depuis la droite quand il entre dans la fenetre.
export const PanierSidebarDesktop = ({ onEditItem }) => {
  const [ref, visible] = useApparition();

  return (
    <aside
      ref={ref}
      className={`sticky top-20 mt-3 flex h-[calc(100vh-6rem)] w-80 shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition duration-700 ease-out ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
      }`}
    >
      <PanierContent onEditItem={onEditItem} />
    </aside>
  );
};