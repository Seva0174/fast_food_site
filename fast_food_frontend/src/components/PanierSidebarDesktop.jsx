import { PanierContent } from './PanierContent';

export const PanierSidebarDesktop = ({ onEditItem }) => {
  return (
    <aside className="w-80 border rounded-2xl bg-white shadow-sm overflow-hidden sticky top-4 h-[calc(100vh-2rem)] flex flex-col">
      <PanierContent onEditItem={onEditItem} />
    </aside>
  );
};