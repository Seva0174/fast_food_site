import { AlertCircle, CheckCircle2 } from 'lucide-react';

// Bandeau affichant un message { texte, type } ('succes' ou 'erreur'), ou rien si message est nul.
export const BandeauMessage = ({ message }) => {
  if (!message) return null;
  const estErreur = message.type === 'erreur';

  return (
    <div
      className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
        estErreur
          ? 'border border-red-200 bg-red-50 text-red-700'
          : 'border border-green-200 bg-green-50 text-green-700'
      }`}
    >
      {estErreur ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
      {message.texte}
    </div>
  );
};