import { Bouton } from '@/components/ui/bouton';
import { ModalShell } from '@/components/modales/ModalShell';

// Modale de confirmation. La demande est { titre, message, libelleConfirmer }.
export const ModalConfirmation = ({ demande, onRepondre }) => {
  if (!demande) return null;

  const { titre = 'Confirmation', message, libelleConfirmer = 'Confirmer' } = demande;

  return (
    <ModalShell
      titre={titre}
      onClose={() => onRepondre(false)}
      actions={
        <>
          <Bouton variante="secondaire" taille="sm" onClick={() => onRepondre(false)}>
            Annuler
          </Bouton>
          <Bouton taille="sm" onClick={() => onRepondre(true)}>
            {libelleConfirmer}
          </Bouton>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">{message}</p>
    </ModalShell>
  );
};