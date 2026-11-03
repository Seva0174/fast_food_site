import { useId, useState } from 'react';
import { Dialog } from 'radix-ui';
import { X } from 'lucide-react';
import { formaterPrix } from '../../lib/prix';

// Base commune des modales. Radix gere le focus (piege, retour au declencheur),
// la touche Echap et le blocage du defilement de la page.
// Pas de Portal : la modale reste dans l'arbre de la page.
export const ModalShell = ({
  titre,
  sousTitre,
  onClose,
  enTete,
  prixLibelle = 'Total produit',
  prixTotal,
  actions,
  largeur = 'max-w-lg',
  // Hauteur fixe (ex : menu en plusieurs etapes) : les boutons ne bougent pas d'une etape a l'autre
  hauteur = '',
  // { question, libelleAbandon } : fermer (Echap, croix, bouton du pied) demande d'abord confirmation
  confirmerFermeture = null,
  // id de l'élément qui décrit la modale (ex : le message d'une confirmation), à la place du sous-titre
  idDescription = null,
  // Élément (ref) qui reçoit le focus à l'ouverture, à la place du premier élément focusable (la croix)
  focusInitial = null,
  children,
}) => {
  const idSousTitre = useId();
  // Element qui avait le focus a l'ouverture (bouton d'une carte, crayon du panier...) :
  // il le recupere a la fermeture. Radix ne le fait que pour un Dialog.Trigger.
  const [declencheur] = useState(() => document.activeElement);
  const [demandeFermeture, setDemandeFermeture] = useState(false);

  const demanderFermeture = () => {
    if (demandeFermeture) setDemandeFermeture(false); // Echap une seconde fois : on reprend
    else if (confirmerFermeture) setDemandeFermeture(true);
    else onClose?.();
  };

  return (
    <Dialog.Root open onOpenChange={(ouvert) => !ouvert && demanderFermeture()}>
      {/* m-0! : sans Portal, la modale peut être l'enfant d'un conteneur space-y-* dont la marge
          raccourcirait le voile (bande non assombrie en bas de l'écran) */}
      <Dialog.Overlay className="fixed inset-0 z-50 m-0! bg-black/70 animate-in fade-in duration-200" />
      <Dialog.Content
        aria-describedby={idDescription ?? (sousTitre ? idSousTitre : undefined)}
        // Un clic a cote ne ferme pas : une composition de menu en cours serait perdue
        onInteractOutside={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => {
          if (!focusInitial?.current) return;
          e.preventDefault();
          focusInitial.current.focus();
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          if (declencheur?.isConnected) declencheur.focus();
        }}
        // Ancree en haut de l'ecran plutot que centree : sa position ne change pas avec son contenu
        className={`fixed left-1/2 top-[5svh] z-50 m-0! flex max-h-[90svh] w-[calc(100%-2rem)] sm:top-[8svh] sm:max-h-[84svh] ${largeur} ${hauteur} -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl outline-none animate-in fade-in zoom-in-95 duration-200`}
      >
        <header className="border-b border-border p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="titre-marque text-3xl">{titre}</Dialog.Title>
              {sousTitre && (
                <p id={idSousTitre} className="mt-1 text-xs text-muted-foreground">
                  {sousTitre}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={demanderFermeture}
              aria-label="Fermer"
              className="-mr-1 -mt-1 flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:size-9"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {enTete}
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-4 scrollbar-thin">{children}</div>

        {demandeFermeture ? (
          <footer
            role="alertdialog"
            aria-label={confirmerFermeture?.question}
            className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-secondary/60 p-4"
          >
            <p className="text-sm font-semibold">{confirmerFermeture?.question}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                autoFocus
                onClick={() => setDemandeFermeture(false)}
                className="min-h-11 rounded-lg border border-border bg-secondary px-4 text-sm font-semibold transition-colors hover:bg-accent"
              >
                Continuer
              </button>
              <button
                type="button"
                onClick={onClose}
                className="min-h-11 rounded-lg border border-destructive/50 px-4 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
              >
                {confirmerFermeture?.libelleAbandon ?? 'Fermer'}
              </button>
            </div>
          </footer>
        ) : (
          // Sur mobile : le total sur sa ligne, puis les actions en pleine largeur
          <footer
            className={`flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center ${
              prixTotal === undefined ? 'sm:justify-end' : 'sm:justify-between'
            }`}
          >
            {prixTotal !== undefined && (
              <div className="flex items-baseline justify-between gap-3 sm:block">
                <span className="block text-xs text-muted-foreground">{prixLibelle}</span>
                <span className="text-xl font-extrabold tabular-nums">
                  {formaterPrix(prixTotal)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 *:flex-1 *:whitespace-nowrap sm:*:flex-none">
              {/* actions peut être une fonction : elle reçoit la fermeture protégée, pour qu'un bouton
                  « Annuler » ou « Fermer » passe par la même confirmation qu'Échap */}
              {typeof actions === 'function' ? actions(demanderFermeture) : actions}
            </div>
          </footer>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
};
