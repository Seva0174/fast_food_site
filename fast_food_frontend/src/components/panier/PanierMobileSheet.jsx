import { useContext } from 'react';
import { Dialog } from 'radix-ui';
import { ContextePanier } from '../../context/ContextePanier';
import { formaterPrix } from '../../lib/prix';
import { PanierContent } from './PanierContent';

// Panier mobile : barre fixe en bas de l'ecran, qui ouvre un tiroir (bottom sheet).
// L'ouverture est pilotee par la page (le lien "Panier" de la navbar peut aussi l'ouvrir).
export const PanierMobileSheet = ({ ouvert, onChangerOuvert, onEditItem }) => {
  const { totalArticles, totalPrix, nombreAjouts } = useContext(ContextePanier);

  return (
    <Dialog.Root open={ouvert} onOpenChange={onChangerOuvert}>
      {totalArticles > 0 && (
        <div className="fixed inset-x-4 bottom-4 z-40 pb-[env(safe-area-inset-bottom)] lg:hidden">
          <Dialog.Trigger className="flex w-full items-center justify-between rounded-2xl bg-primary px-5 py-3.5 text-primary-foreground shadow-xl shadow-black/50 transition-transform active:scale-[0.98]">
            <span className="flex items-center gap-2.5">
              <span
                key={nombreAjouts}
                className="pulsation-panier rounded-full bg-primary-foreground px-2.5 py-0.5 text-xs font-extrabold tabular-nums text-primary"
              >
                {totalArticles}
              </span>
              <span className="text-base font-bold">Voir le panier</span>
            </span>
            <span className="text-lg font-extrabold tabular-nums">{formaterPrix(totalPrix)}</span>
          </Dialog.Trigger>
        </div>
      )}

      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 animate-in fade-in duration-200 lg:hidden" />
      <Dialog.Content
        aria-describedby={undefined}
        // Le focus va au tiroir lui-meme, pas au premier bouton ("Vider")
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          e.currentTarget.focus();
        }}
        className="fixed inset-x-0 bottom-0 z-50 flex h-[min(560px,85svh)] flex-col overflow-hidden rounded-t-3xl border-t border-border bg-card pb-[env(safe-area-inset-bottom)] outline-none animate-in slide-in-from-bottom duration-300 lg:hidden"
      >
        <Dialog.Title className="sr-only">Mon panier</Dialog.Title>
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/40" aria-hidden="true" />
        <PanierContent onEditItem={onEditItem} onClose={() => onChangerOuvert(false)} />
      </Dialog.Content>
    </Dialog.Root>
  );
};
