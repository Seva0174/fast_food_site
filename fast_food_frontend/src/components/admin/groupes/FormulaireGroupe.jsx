import { useState } from 'react';
import { Bouton } from '@/components/ui/bouton';
import { FORMULAIRE_GROUPE_VIDE } from '@/lib/options';

const classeChamp =
  'w-full rounded border bg-white px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-red-500';
const classeLabel = 'mb-1 block text-xs font-medium text-gray-700';

// Formulaire de création d'un groupe (nom, sélection minimale et maximale).
// onCreer reçoit le formulaire et renvoie true si le groupe a été créé.
export const FormulaireGroupe = ({
  titre,
  placeholderNom,
  libelleBouton,
  libelleNom = 'Nom du groupe',
  libelleMin = 'Sélection min.',
  aideMin = '(0 = Optionnel)',
  libelleMax = 'Sélection max.',
  onCreer,
}) => {
  const [formulaire, setFormulaire] = useState(FORMULAIRE_GROUPE_VIDE);

  const modifier = (champ) => (e) => setFormulaire({ ...formulaire, [champ]: e.target.value });

  const soumettre = async (e) => {
    e.preventDefault();
    if (await onCreer(formulaire)) setFormulaire(FORMULAIRE_GROUPE_VIDE);
  };

  return (
    <form onSubmit={soumettre} className="space-y-3 rounded-lg border bg-gray-50 p-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">{titre}</h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className={classeLabel}>{libelleNom}</label>
          <input
            type="text"
            required
            placeholder={placeholderNom}
            value={formulaire.nom}
            onChange={modifier('nom')}
            className={classeChamp}
          />
        </div>
        <div>
          <label className={classeLabel}>
            {libelleMin} <span className="font-normal text-gray-400">{aideMin}</span>
          </label>
          <input
            type="number"
            min="0"
            required
            value={formulaire.minSelection}
            onChange={modifier('minSelection')}
            className={classeChamp}
          />
        </div>
        <div>
          <label className={classeLabel}>{libelleMax}</label>
          <input
            type="number"
            min="1"
            required
            value={formulaire.maxSelection}
            onChange={modifier('maxSelection')}
            className={classeChamp}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Bouton type="submit" taille="xs">
          {libelleBouton}
        </Bouton>
      </div>
    </form>
  );
};