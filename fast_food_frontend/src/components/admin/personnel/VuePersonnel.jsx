import { useContext, useEffect, useId, useRef, useState } from 'react';
import { EnTeteVueAdmin } from '@/components/admin/EnTeteVueAdmin';
import { UserPlus } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { MessageFlottant } from '@/components/ui/message-flottant';
import { ModalConfirmation } from '@/components/modales/ModalConfirmation';
import { ModalShell } from '@/components/modales/ModalShell';
import { AuthContext } from '@/context/AuthProvider';
import { useConfirmation } from '@/hooks/useConfirmation';
import { usePersonnel } from '@/hooks/usePersonnel';
import { DetailEmploye } from './DetailEmploye';
import { FormulaireEmploye } from './FormulaireEmploye';
import { TableauEmployes } from './TableauEmployes';

export function VuePersonnel() {
  const { user } = useContext(AuthContext);
  const { employes, chargement, erreur, message, afficher, charger, creer, modifier, supprimer } =
    usePersonnel();
  const { confirmer, modaleProps } = useConfirmation();
  const [idSelectionne, setIdSelectionne] = useState(null);
  const [embaucheOuverte, setEmbaucheOuverte] = useState(false);
  const idFormulaire = useId();
  const titreEquipe = useRef(null);
  const titreDetail = useRef(null);

  // L'employé est relu dans la liste, pour rester à jour après une modification
  const employeSelectionne = employes.find((e) => e.id === idSelectionne);

  // Employé dont le détail vient d'être fermé : son bouton « Heures et paie » reprend le focus
  const retourFocus = useRef(null);

  // Le détail s'ouvre sous le tableau : on l'amène à l'écran et le focus suit.
  // À la fermeture, le focus revient à la ligne d'où il était parti.
  useEffect(() => {
    if (!idSelectionne) {
      if (retourFocus.current === null) return;
      document.querySelector(`[data-heures-employe="${retourFocus.current}"]`)?.focus();
      retourFocus.current = null;
      return;
    }
    titreDetail.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    titreDetail.current?.focus({ preventScroll: true });
  }, [idSelectionne]);

  const demanderSuppression = async (employe) => {
    const confirme = await confirmer({
      titre: "Retirer de l'équipe ?",
      message: `Le compte de ${employe.nom} sera supprimé et ne permettra plus de se connecter. Cette action est irréversible.`,
      libelleConfirmer: "Retirer de l'équipe",
      libelleRefuser: 'Garder',
      destructif: true,
    });
    if (!confirme) return;

    if (await supprimer(employe.id)) {
      if (idSelectionne === employe.id) setIdSelectionne(null);
      // La ligne a disparu : le focus revient au titre de l'équipe
      titreEquipe.current?.focus();
    }
  };

  const fermerDetail = () => {
    retourFocus.current = idSelectionne;
    setIdSelectionne(null);
  };

  const embaucher = async (donnees) => {
    const cree = await creer(donnees);
    if (cree) setEmbaucheOuverte(false);
    return cree;
  };

  return (
    <div className="space-y-6">
      <EnTeteVueAdmin
        titre="Équipe"
        refTitre={titreEquipe}
        compteur={!chargement && !erreur && `${employes.length} personne${employes.length > 1 ? 's' : ''}`}
        description="Accès au site, poste, taux horaire, heures travaillées et paie de chaque employé."
        actions={
          <Bouton onClick={() => setEmbaucheOuverte(true)}>
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Embaucher
          </Bouton>
        }
      />

      <TableauEmployes
        employes={employes}
        chargement={chargement}
        erreur={erreur}
        idSelectionne={idSelectionne}
        emailConnecte={user?.email}
        onRecharger={charger}
        onModifier={modifier}
        onGererHeures={(employe) => setIdSelectionne(employe.id)}
        onSupprimer={demanderSuppression}
      />

      {employeSelectionne && (
        // key : les heures et la période repartent à zéro à chaque changement d'employé
        <DetailEmploye
          key={employeSelectionne.id}
          employe={employeSelectionne}
          afficher={afficher}
          onFermer={fermerDetail}
          refTitre={titreDetail}
        />
      )}

      {embaucheOuverte && (
        <ModalShell
          titre="Embaucher"
          sousTitre="Le nouveau membre pourra se connecter avec cet email et ce mot de passe."
          onClose={() => setEmbaucheOuverte(false)}
          actions={
            <>
              <Bouton variante="secondaire" taille="sm" onClick={() => setEmbaucheOuverte(false)}>
                Annuler
              </Bouton>
              <Bouton type="submit" form={idFormulaire} taille="sm">
                Créer le compte
              </Bouton>
            </>
          }
        >
          <FormulaireEmploye idFormulaire={idFormulaire} onCreer={embaucher} />
        </ModalShell>
      )}

      <ModalConfirmation {...modaleProps} />

      <MessageFlottant message={message} />
    </div>
  );
}
