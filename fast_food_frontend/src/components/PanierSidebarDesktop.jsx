import { PanierContent } from './PanierContent';

export const PanierSidebarDesktop = ({ onEditItem }) => {
  return (
    <aside className="w-80 border rounded-2xl bg-white shadow-sm overflow-hidden sticky top-4">
      <PanierContent onEditItem={onEditItem} />
    </aside>
  );
};