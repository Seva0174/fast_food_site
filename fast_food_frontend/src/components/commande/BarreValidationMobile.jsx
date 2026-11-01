import { formaterPrix } from '../../lib/prix';
import { TYPE_RETRAIT } from '../../lib/commande';

// Barre fixe en bas de l'ecran sur mobile : total et validation toujours a portee de pouce.
// Le bouton soumet le formulaire de retrait (id "form-commande") : la validation native
// des champs d'adresse s'applique comme avec le bouton du formulaire.
// Le mode de retrait est rappele dans le bouton : on ne valide jamais sans l'avoir vu.
export const BarreValidationMobile = ({ totalPrix, typeRetrait, chargement, desactive }) => (
  <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
    <div className="flex items-center gap-4">
      <div className="shrink-0">
        <span className="block text-xs text-muted-foreground">Total</span>
        <span className="text-xl font-extrabold tabular-nums">{formaterPrix(totalPrix)}</span>
      </div>
      <button
        type="submit"
        form="form-commande"
        disabled={desactive || chargement}
        className="min-h-12 flex-1 whitespace-nowrap rounded-lg bg-primary px-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {chargement
          ? 'Envoi…'
          : `Valider · ${typeRetrait === TYPE_RETRAIT.LIVRAISON ? 'Livraison' : 'Click & collect'}`}
      </button>
    </div>
  </div>
);
