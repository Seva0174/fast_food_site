import { useState } from 'react';
import { Bouton } from '@/components/ui/bouton';
import { ListeDeroulante } from '@/components/ui/liste';
import { FORMULAIRE_OPTION_VIDE, proposerNomOption } from '@/lib/options';

const classeChamp =
  'w-full rounded border bg-white px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-red-500';
const classeLabel = 'mb-0.5 block text-[10px] font-medium text-gray-600';

// Formulaire d'une option, pour l'ajout comme pour la modification.
// onSoumettre reçoit le formulaire et renvoie true si l'enregistrement a réussi.
export const FormulaireOption = ({
  matieresPremieres,
  initial = FORMULAIRE_OPTION_VIDE,
  titre,
  libelleBouton,
  onSoumettre,
  onAnnuler,
}) => {
  const [formulaire, setFormulaire] = useState(initial);

  const modifier = (champ) => (e) => setFormulaire({ ...formulaire, [champ]: e.target.value });

  // Le nom suit la matière choisie tant qu'il n'a pas été personnalisé
  const changerMatiere = (idMatiere) => {
    const precedente = matieresPremieres.find((m) => String(m.id) === formulaire.idMatiere);
    const choisie = matieresPremieres.find((m) => String(m.id) === idMatiere);
    setFormulaire({
      ...formulaire,
      idMatiere,
      nom: proposerNomOption(formulaire.nom, precedente?.nom ?? '', choisie?.nom ?? formulaire.nom),
    });
  };

  const soumettre = async (e) => {
    e.preventDefault();
    if (await onSoumettre(formulaire)) onAnnuler();
  };

  return (
    <form
      onSubmit={soumettre}
      className="mt-2 space-y-2 rounded-md border border-red-200 bg-red-50/50 p-3"
    >
      <h5 className="text-[11px] font-bold uppercase text-red-800">{titre}</h5>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label className={classeLabel}>Nom de l'option</label>
          <input
            type="text"
            required
            value={formulaire.nom}
            onChange={modifier('nom')}
            className={classeChamp}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={classeLabel}>Matière première</label>
          <ListeDeroulante
            valeur={formulaire.idMatiere}
            onChange={changerMatiere}
            options={matieresPremieres.map((m) => ({ value: m.id, label: m.nom }))}
            placeholder="-- Sélectionner --"
            className="w-full bg-white px-2 py-1 text-xs"
            classeItem="text-xs"
          />
        </div>
        <div>
          <label className={classeLabel}>Qté déduite</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={formulaire.quantiteDeduite}
            onChange={modifier('quantiteDeduite')}
            className={classeChamp}
          />
        </div>
        <div>
          <label className={classeLabel}>Surcoût (€)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formulaire.surcout}
            onChange={modifier('surcout')}
            className={classeChamp}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Bouton variante="secondaire" taille="xs" onClick={onAnnuler}>
          Annuler
        </Bouton>
        <Bouton type="submit" taille="xs">
          {libelleBouton}
        </Bouton>
      </div>
    </form>
  );
};