import { useState } from 'react';
import { Bouton } from '@/components/ui/bouton';
import { BandeauMessage } from '@/components/ui/bandeau';
import { estSonCompte } from '@/lib/personnel';
import { LigneEmploye } from './LigneEmploye';

export const TableauEmployes = ({
  employes,
  chargement,
  erreur,
  idSelectionne,
  emailConnecte,
  onRecharger,
  onModifier,
  onGererHeures,
  onSupprimer,
}) => {
  // Une seule ligne en édition à la fois ; les crayons des autres lignes sont inactifs en attendant
  const [idEnEdition, setIdEnEdition] = useState(null);

  if (chargement) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Chargement de l'équipe…
      </p>
    );
  }

  if (erreur) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <BandeauMessage message={{ texte: erreur, type: 'erreur' }} className="flex-1" />
        <Bouton variante="secondaire" onClick={onRecharger}>
          Réessayer
        </Bouton>
      </div>
    );
  }

  if (employes.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Aucun employé pour le moment. Ajoute le premier avec « Embaucher ».
      </p>
    );
  }

  return (
    // relative : les éléments sr-only (positionnés en absolu) restent dans la zone qui défile
    <div className="relative overflow-x-auto rounded-xl border border-border bg-card">
      {/* Largeurs fixes : les colonnes ne bougent pas quand une ligne passe en édition */}
      <table className="w-full min-w-[56rem] table-fixed border-collapse text-left text-sm">
        <caption className="sr-only">Membres de l'équipe</caption>
        <colgroup>
          {/* Sous 1280px, colonnes resserrees (1024px sans defilement) ; au-dela, l'email tient en entier */}
          <col className="w-[18%] xl:w-[16%]" />
          <col className="w-[15%] xl:w-[22%]" />
          <col className="w-[18%] xl:w-[15%]" />
          <col className="w-[14%] xl:w-[12%]" />
          <col className="w-[11%] xl:w-[10%]" />
          <col className="w-[24%] xl:w-[25%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th scope="col" className="p-3 font-medium">Nom</th>
            <th scope="col" className="p-3 font-medium">Email</th>
            <th scope="col" className="p-3 font-medium">Accès au site</th>
            <th scope="col" className="p-3 font-medium">Poste</th>
            <th scope="col" className="whitespace-nowrap p-3 text-right font-medium">Taux horaire</th>
            <th scope="col" className="p-3 text-right font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {employes.map((employe) => (
            <LigneEmploye
              key={employe.id}
              employe={employe}
              selectionne={idSelectionne === employe.id}
              estMonCompte={estSonCompte(employe, emailConnecte)}
              enEdition={idEnEdition === employe.id}
              editionAilleurs={idEnEdition !== null && idEnEdition !== employe.id}
              onEditer={setIdEnEdition}
              onModifier={onModifier}
              onGererHeures={onGererHeures}
              onSupprimer={onSupprimer}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
