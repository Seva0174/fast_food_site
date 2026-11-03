import { BandeauMessage } from '@/components/ui/bandeau';

// Retour d'action en bas de l'écran, visible où que l'on soit sur la page (et au-dessus des modales).
// Fond carte sous le bandeau : sa teinte reste opaque au-dessus du contenu. Style neutre : l'orange
// reste réservé à l'action principale de la page.
// message.action ({ libelle, onClick }) ajoute un bouton dans le bandeau, par exemple « Annuler » :
// le message devient alors cliquable et reste plus longtemps.
// À placer hors d'une modale : un parent transformé fausserait la position fixe.
export const MessageFlottant = ({ message }) =>
  message ? (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[70] w-full max-w-md -translate-x-1/2 px-4">
      <div
        className={`rounded-lg bg-card shadow-xl shadow-black/20 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
          message.action ? 'pointer-events-auto' : ''
        }`}
      >
        <BandeauMessage message={message} neutre />
      </div>
    </div>
  ) : null;
