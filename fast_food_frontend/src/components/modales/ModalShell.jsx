import { useEffect } from 'react';
import { X } from 'lucide-react';

export const ModalShell = ({
  titre,
  sousTitre,
  onClose,
  enTete,
  prixLibelle = 'Total produit',
  prixTotal,
  actions,
  largeur = 'max-w-lg',
  children,
}) => {
  // Echap ferme la modale
  useEffect(() => {
    const surTouche = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titre}
        className={`flex max-h-[90vh] w-full ${largeur} flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl animate-in fade-in zoom-in-95 duration-200`}
      >
        <header className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="titre-marque text-3xl">{titre}</h3>
              {sousTitre && <p className="mt-1 text-xs text-muted-foreground">{sousTitre}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {enTete}
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-4 scrollbar-thin">{children}</div>

        <footer
          className={`flex items-center gap-4 border-t border-border p-4 ${
            prixTotal === undefined ? 'justify-end' : 'justify-between'
          }`}
        >
          {prixTotal !== undefined && (
            <div>
              <span className="block text-xs text-muted-foreground">{prixLibelle}</span>
              <span className="text-xl font-extrabold tabular-nums">{prixTotal.toFixed(2)} €</span>
            </div>
          )}
          <div className="flex items-center gap-2">{actions}</div>
        </footer>
      </div>
    </div>
  );
};