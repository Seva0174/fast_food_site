import { useState } from 'react';
import { Bouton } from '@/components/ui/bouton';
import { ModalConfirmation } from '@/components/modales/ModalConfirmation';
import { useConfirmation } from '@/hooks/useConfirmation';
import { useHeuresEmploye } from '@/hooks/useHeuresEmploye';
import { formaterHeures } from '@/lib/personnel';

// Saisie, filtre par période et liste des heures d'un employé.
export const PanneauHeures = ({ employe, afficher }) => {
  const { heures, periode, filtrer, reinitialiserFiltre, ajouter, supprimer } = useHeuresEmploye(
    employe.id,
    afficher
  );
  const { confirmer, modaleProps } = useConfirmation();

  const [date, setDate] = useState('');
  const [saisieHeures, setSaisieHeures] = useState('8');
  const [saisieMinutes, setSaisieMinutes] = useState('0');
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');

  const soumettreSaisie = async (e) => {
    e.preventDefault();
    if (await ajouter(date, saisieHeures, saisieMinutes)) {
      setDate('');
      setSaisieHeures('8');
      setSaisieMinutes('0');
    }
  };

  const soumettreFiltre = (e) => {
    e.preventDefault();
    filtrer(debut, fin);
  };

  const effacerFiltre = () => {
    setDebut('');
    setFin('');
    reinitialiserFiltre();
  };

  const demanderSuppression = async (heure) => {
    const confirme = await confirmer({
      titre: 'Supprimer une saisie',
      message: `Voulez-vous vraiment supprimer la saisie du ${heure.date} ?`,
      libelleConfirmer: 'Supprimer',
    });
    if (confirme) await supprimer(heure.id);
  };

  return (
    <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
      <div className="border-b pb-2">
        <h3 className="text-lg font-bold text-gray-800">
          Heures travaillées — <span className="text-red-600">{employe.nom}</span>
        </h3>
      </div>

      <form onSubmit={soumettreSaisie} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded border px-2 py-1.5 text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Heures (0 à 24)</label>
            <input
              type="number"
              min="0"
              max="24"
              value={saisieHeures}
              onChange={(e) => setSaisieHeures(e.target.value)}
              className="w-full rounded border px-2 py-1.5 text-sm"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Minutes (0 à 59)</label>
            <input
              type="number"
              min="0"
              max="59"
              step="5"
              value={saisieMinutes}
              onChange={(e) => setSaisieMinutes(e.target.value)}
              className="w-full rounded border px-2 py-1.5 text-sm"
              required
            />
          </div>
        </div>

        <Bouton type="submit" variante="sombre" taille="sm" className="w-full">
          Valider la saisie
        </Bouton>
      </form>

      <div className="space-y-2 border-t pt-2">
        <span className="text-xs font-semibold text-gray-500">Filtrer par période :</span>
        <form onSubmit={soumettreFiltre} className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={debut}
            onChange={(e) => setDebut(e.target.value)}
            className="flex-1 rounded border px-2 py-1 text-xs"
            required
          />
          <span className="text-xs text-gray-400">à</span>
          <input
            type="date"
            value={fin}
            onChange={(e) => setFin(e.target.value)}
            className="flex-1 rounded border px-2 py-1 text-xs"
            required
          />
          <Bouton type="submit" taille="xs">
            Valider la période
          </Bouton>
          {(periode || debut || fin) && (
            <Bouton variante="discret" taille="nu" className="text-xs" onClick={effacerFiltre}>
              Effacer
            </Bouton>
          )}
        </form>
      </div>

      <div className="max-h-48 divide-y overflow-y-auto rounded border text-sm">
        {heures.length === 0 ? (
          <p className="p-3 text-xs text-gray-400">Aucune heure trouvée pour cette sélection.</p>
        ) : (
          heures.map((heure) => (
            <div key={heure.id} className="flex items-center justify-between p-2 hover:bg-gray-50">
              <div>
                <span className="mr-2 font-medium text-gray-800">{heure.date}</span>
                <span className="text-xs text-gray-500">({formaterHeures(heure.nbHeure)})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-700">{heure.nbHeure}h</span>
                <button
                  type="button"
                  onClick={() => demanderSuppression(heure)}
                  className="px-1 text-xs font-bold text-red-500 hover:text-red-700"
                  title="Supprimer la saisie"
                  aria-label="Supprimer la saisie"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ModalConfirmation {...modaleProps} />
    </div>
  );
};