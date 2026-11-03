import { useId, useRef } from 'react';
import { Bouton } from '@/components/ui/bouton';
import { ModalShell } from '@/components/modales/ModalShell';

// Modale de confirmation. La demande est { titre, message, libelleConfirmer, libelleRefuser, destructif }.
// destructif : le bouton de confirmation passe en rouge (action qu'on ne peut pas defaire).
export const ModalConfirmation = ({ demande, onRepondre }) => {
  const boutonRefuser = useRef(null);
  const idMessage = useId();
  if (!demande) return null;

  const {
    titre = 'Confirmation',
    message,
    libelleConfirmer = 'Confirmer',
    libelleRefuser = 'Annuler',
    destructif = false,
  } = demande;

  return (
    <ModalShell
      titre={titre}
      onClose={() => onRepondre(false)}
      focusInitial={destructif ? boutonRefuser : null}
      idDescription={idMessage}
      actions={
        <>
          {/* Action irréversible : le focus part sur le choix sans risque (même dans une autre modale) */}
          <Bouton
            ref={boutonRefuser}
            variante="secondaire"
            taille="sm"
            onClick={() => onRepondre(false)}
          >
            {libelleRefuser}
          </Bouton>
          <Bouton
            variante={destructif ? 'dangerPlein' : 'principal'}
            taille="sm"
            onClick={() => onRepondre(true)}
          >
            {libelleConfirmer}
          </Bouton>
        </>
      }
    >
      <p id={idMessage} className="text-sm text-muted-foreground">
        {message}
      </p>
    </ModalShell>
  );
};