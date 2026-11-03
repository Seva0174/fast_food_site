import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

const STYLES = {
  erreur: { classes: 'border-destructive/40 bg-destructive/15 text-foreground', icone: AlertCircle, couleurIcone: 'text-destructive' },
  succes: { classes: 'border-primary/40 bg-card text-foreground', icone: CheckCircle2, couleurIcone: 'text-primary' },
  // Action reussie en partie : le client doit lire ce qui manque
  // Retour d'action dans l'administration : sans orange
  succesNeutre: { classes: 'border-border bg-card text-foreground', icone: CheckCircle2, couleurIcone: 'text-foreground' },
  avertissement: { classes: 'border-primary bg-card text-foreground', icone: AlertTriangle, couleurIcone: 'text-primary' },
};

// Bandeau affichant un message { texte, type } ('succes' ou 'erreur'), ou rien si message est nul.
// Les erreurs sont annoncees immediatement aux lecteurs d'ecran, les succes poliment.
// annoncer={false} : avertissement permanent affiche avec la page, lu dans le flux normal.
// neutre : un succes sans orange (administration).
export const BandeauMessage = ({ message, className = '', annoncer = true, neutre = false }) => {
  if (!message) return null;
  const cle = neutre && message.type === 'succes' ? 'succesNeutre' : message.type;
  const { classes, icone: Icone, couleurIcone } = STYLES[cle] ?? STYLES.succes;
  const estErreur = message.type === 'erreur';

  return (
    <div
      role={annoncer ? (estErreur ? 'alert' : 'status') : undefined}
      className={`flex items-center gap-2.5 rounded-lg border p-3 text-sm ${classes} ${className}`}
    >
      <Icone className={`h-5 w-5 shrink-0 ${couleurIcone}`} aria-hidden="true" />
      <span className="flex-1">{message.texte}</span>
      {/* Action facultative (ex : « Annuler ») : message.action = { libelle, onClick } */}
      {message.action && (
        <button
          type="button"
          onClick={message.action.onClick}
          className="-my-1 shrink-0 rounded-md px-2.5 py-1 font-semibold underline underline-offset-4 transition-colors hover:bg-accent"
        >
          {message.action.libelle}
        </button>
      )}
    </div>
  );
};
