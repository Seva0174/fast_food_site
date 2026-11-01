import { Bouton } from '@/components/ui/bouton';
import { ModalShell } from '@/components/modales/ModalShell';

// Modale de confirmation. La demande est { titre, message, libelleConfirmer, libelleRefuser, destructif }.
// destructif : le bouton de confirmation passe en rouge (action qu'on ne peut pas defaire).
export const ModalConfirmation = ({ demande, onRepondre }) => {
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
      actions={
        <>
          <Bouton variante="secondaire" taille="sm" onClick={() => onRepondre(false)}>
            {libelleRefuser}
          </Bouton>
          <Bouton
            variante={destructif ? 'danger' : 'principal'}
            taille="sm"
            onClick={() => onRepondre(true)}
          >
            {libelleConfirmer}
          </Bouton>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">{message}</p>
    </ModalShell>
  );
};