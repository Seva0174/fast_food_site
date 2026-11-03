import { useRef } from 'react';
import { Popover } from 'radix-ui';

// Fenêtre flottante qui accueille un calendrier, ouverte par un bouton (`declencheur`).
// À l'ouverture, le focus va directement sur le jour actif du calendrier ; à la fermeture, il revient
// au bouton. Pas de Portal : la fenêtre reste dans l'arbre de la page et hérite de son thème
// (les pages admin sont encore en thème clair, voir MainLayout).
export const FenetreCalendrier = ({ ouvert, onOuvertChange, declencheur, libelle, children }) => {
  const contenu = useRef(null);

  return (
    <Popover.Root open={ouvert} onOpenChange={onOuvertChange}>
      <Popover.Trigger asChild>{declencheur}</Popover.Trigger>
      <Popover.Content
        ref={contenu}
        align="start"
        sideOffset={8}
        collisionPadding={16}
        aria-label={libelle}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          contenu.current?.querySelector('[data-date][tabindex="0"]')?.focus();
        }}
        className="z-50 rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-md animate-in fade-in zoom-in-95 duration-150"
      >
        {children}
      </Popover.Content>
    </Popover.Root>
  );
};
