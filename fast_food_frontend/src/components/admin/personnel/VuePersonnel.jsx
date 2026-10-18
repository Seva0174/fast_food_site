import { useContext, useState } from 'react';
import { BandeauMessage } from '@/components/ui/bandeau';
import { ModalConfirmation } from '@/components/modales/ModalConfirmation';
import { AuthContext } from '@/context/AuthProvider';
import { useConfirmation } from '@/hooks/useConfirmation';
import { usePersonnel } from '@/hooks/usePersonnel';
import { FichePaie } from './FichePaie';
import { FormulaireEmploye } from './FormulaireEmploye';
import { PanneauHeures } from './PanneauHeures';
import { TableauEmployes } from './TableauEmployes';

export function VuePersonnel() {
  const { user } = useContext(AuthContext);
  const { employes, chargement, erreur, message, afficher, creer, modifier, supprimer } = usePersonnel();
  const { confirmer, modaleProps } = useConfirmation();
  const [idSelectionne, setIdSelectionne] = useState(null);

  // L'employé est relu dans la liste, pour rester à jour après une modification
  const employeSelectionne = employes.find((e) => e.id === idSelectionne);

  const demanderSuppression = async (employe) => {
    const confirme = await confirmer({
      titre: 'Licencier un employé',
      message: `Supprimer ${employe.nom} supprimera également son compte utilisateur. Confirmer ?`,
      libelleConfirmer: 'Licencier',
    });
    if (!confirme) return;

    if ((await supprimer(employe.id)) && idSelectionne === employe.id) {
      setIdSelectionne(null);
    }
  };

  return (
    <div className="space-y-6">
      <BandeauMessage message={message} />

      <FormulaireEmploye onCreer={creer} />

      <TableauEmployes
        employes={employes}
        chargement={chargement}
        erreur={erreur}
        idSelectionne={idSelectionne}
        emailConnecte={user?.email}
        onModifier={modifier}
        onGererHeures={(employe) => setIdSelectionne(employe.id)}
        onSupprimer={demanderSuppression}
      />

      {employeSelectionne && (
        // key : l'état des heures et de la fiche de paie repart à zéro à chaque changement d'employé
        <div key={employeSelectionne.id} className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <PanneauHeures employe={employeSelectionne} afficher={afficher} />
          <FichePaie employe={employeSelectionne} afficher={afficher} />
        </div>
      )}

      <ModalConfirmation {...modaleProps} />
    </div>
  );
}