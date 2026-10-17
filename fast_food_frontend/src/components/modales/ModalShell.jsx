import { X } from 'lucide-react';

// Le pied de page n'affiche le prix que si prixTotal est fourni.
export const ModalShell = ({
  titre,
  sousTitre,
  onClose,
  enTete,
  prixLibelle = 'Total produit',
  prixTotal,
  actions,
  children,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
      <header className="border-b bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{titre}</h3>
            {sousTitre && <p className="text-xs text-gray-500">{sousTitre}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {enTete}
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">{children}</div>

      <footer
        className={`flex items-center gap-4 border-t bg-white p-4 ${
          prixTotal === undefined ? 'justify-end' : 'justify-between'
        }`}
      >
        {prixTotal !== undefined && (
          <div>
            <span className="block text-xs text-gray-500">{prixLibelle}</span>
            <span className="text-xl font-extrabold text-gray-900">{prixTotal.toFixed(2)} €</span>
          </div>
        )}
        <div className="flex items-center gap-2">{actions}</div>
      </footer>
    </div>
  </div>
);