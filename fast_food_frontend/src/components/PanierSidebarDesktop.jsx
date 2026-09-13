import { PanierContent } from './PanierContent';

export const PanierSidebarDesktop = () => {
  return (
    <aside className="hidden lg:block w-80 bg-white border-l border-gray-200 h-[calc(100vh-4rem)] sticky top-16 shadow-sm rounded-xl overflow-hidden">
      <PanierContent />
    </aside>
  );
};