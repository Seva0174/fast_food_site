import { PanierContent } from './panier/PanierContent';

export const PanierSidebarDesktop = ({ onEditItem }) => {
  return (
    <aside className="sticky top-20 flex h-[calc(100vh-6rem)] w-80 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm">
      <PanierContent onEditItem={onEditItem} />
    </aside>
  );
};