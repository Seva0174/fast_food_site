import { useState } from 'react';
import { Bouton } from '@/components/ui/bouton';
import { estObligatoire } from '@/lib/options';

const classeChamp = 'rounded border bg-white px-2 py-1 text-xs';

// En-tête d'un groupe : badge obligatoire ou optionnel, maximum, et modification en place.
// onModifier reçoit (idGroupe, formulaire) et renvoie true si le groupe a été modifié.
export const EnTeteGroupe = ({ groupe, onModifier, onSupprimer }) => {
  const [enEdition, setEnEdition] = useState(false);
  const [formulaire, setFormulaire] = useState(null);

  const demarrerEdition = () => {
    setFormulaire({
      nom: groupe.nom,
      minSelection: groupe.minSelection,
      maxSelection: groupe.maxSelection,
    });
    setEnEdition(true);
  };

  const enregistrer = async () => {
    if (await onModifier(groupe.id, formulaire)) setEnEdition(false);
  };

  const modifier = (champ) => (e) => setFormulaire({ ...formulaire, [champ]: e.target.value });

  if (enEdition) {
    return (
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
          <input
            type="text"
            required
            value={formulaire.nom}
            onChange={modifier('nom')}
            placeholder="Nom du groupe"
            className={`${classeChamp} font-bold text-gray-800`}
          />
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[10px] text-gray-500">Min:</span>
            <input
              type="number"
              min="0"
              required
              value={formulaire.minSelection}
              onChange={modifier('minSelection')}
              className={`${classeChamp} w-16`}
            />
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[10px] text-gray-500">Max:</span>
            <input
              type="number"
              min="1"
              required
              value={formulaire.maxSelection}
              onChange={modifier('maxSelection')}
              className={`${classeChamp} w-16`}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Bouton variante="succes" taille="xs" onClick={enregistrer}>
            Enregistrer
          </Bouton>
          <Bouton variante="secondaire" taille="xs" onClick={() => setEnEdition(false)}>
            Annuler
          </Bouton>
        </div>
      </div>
    );
  }

  const obligatoire = estObligatoire(groupe);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-bold text-gray-800">{groupe.nom}</span>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
            obligatoire
              ? 'border-amber-200 bg-amber-100 text-amber-800'
              : 'border-blue-200 bg-blue-100 text-blue-800'
          }`}
        >
          {obligatoire ? `Obligatoire (${groupe.minSelection} min)` : 'Optionnel'}
        </span>
        <span className="text-xs text-gray-500">
          Max : <strong className="text-gray-700">{groupe.maxSelection}</strong>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Bouton variante="lienInfo" taille="nu" className="text-xs" onClick={demarrerEdition}>
          Modifier
        </Bouton>
        <span className="text-gray-300">|</span>
        <Bouton variante="lien" taille="nu" className="text-xs" onClick={() => onSupprimer(groupe)}>
          Supprimer
        </Bouton>
      </div>
    </div>
  );
};