import { PanierContent } from './PanierContent';

export const PanierSidebarDesktop = ({ onEditItem }) => {
  return (
    <aside className="sticky top-20 mt-3 flex h-[calc(100vh-6rem)] w-80 shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <PanierContent onEditItem={onEditItem} />
    </aside>
  );
};