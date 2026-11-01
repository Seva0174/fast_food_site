import { AlertCircle, CheckCircle2 } from 'lucide-react';

const STYLES = {
  erreur: { classes: 'border-destructive/40 bg-destructive/15 text-foreground', icone: AlertCircle, couleurIcone: 'text-destructive' },
  succes: { classes: 'border-primary/40 bg-card text-foreground', icone: CheckCircle2, couleurIcone: 'text-primary' },
};

// Bandeau affichant un message { texte, type } ('succes' ou 'erreur'), ou rien si message est nul.
// Les erreurs sont annoncees immediatement aux lecteurs d'ecran, les succes poliment.
export const BandeauMessage = ({ message, className = '' }) => {
  if (!message) return null;
  const { classes, icone: Icone, couleurIcone } = STYLES[message.type] ?? STYLES.succes;
  const estErreur = message.type === 'erreur';

  return (
    <div
      role={estErreur ? 'alert' : 'status'}
      className={`flex items-center gap-2.5 rounded-lg border p-3 text-sm ${classes} ${className}`}
    >
      <Icone className={`h-5 w-5 shrink-0 ${couleurIcone}`} aria-hidden="true" />
      <span>{message.texte}</span>
    </div>
  );
};
