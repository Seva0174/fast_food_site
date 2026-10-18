import { useState } from 'react';
import { Bouton } from '@/components/ui/bouton';
import { erreurPeriode } from '@/lib/periode';

const MODE_GLOBAL = 'global';
const MODE_PERSONNALISE = 'personnalise';

const classeDate =
  'rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500';

// Choix entre la vue globale et une période personnalisée.
// onChanger reçoit null (vue globale) ou { debut, fin }.
export const BarrePeriode = ({ onChanger }) => {
  const [mode, setMode] = useState(MODE_GLOBAL);
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');
  const erreur = erreurPeriode(debut, fin);

  const changerMode = (nouveauMode) => {
    setMode(nouveauMode);
    if (nouveauMode === MODE_GLOBAL) {
      setDebut('');
      setFin('');
      onChanger(null);
    }
  };

  const filtrer = (e) => {
    e.preventDefault();
    if (debut && fin && !erreur) onChanger({ debut, fin });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex gap-2">
        <Bouton
          variante={mode === MODE_GLOBAL ? 'principal' : 'neutre'}
          taille="sm"
          onClick={() => changerMode(MODE_GLOBAL)}
        >
          Vue globale
        </Bouton>
        <Bouton
          variante={mode === MODE_PERSONNALISE ? 'principal' : 'neutre'}
          taille="sm"
          onClick={() => changerMode(MODE_PERSONNALISE)}
        >
          Période personnalisée
        </Bouton>
      </div>

      {mode === MODE_PERSONNALISE && (
        <form onSubmit={filtrer} className="flex items-center gap-3">
          <input
            type="date"
            value={debut}
            onChange={(e) => setDebut(e.target.value)}
            className={classeDate}
            required
          />
          <span className="text-sm text-gray-500">au</span>
          <input
            type="date"
            value={fin}
            onChange={(e) => setFin(e.target.value)}
            className={classeDate}
            required
          />
          <Bouton type="submit" variante="sombre" taille="sm" disabled={Boolean(erreur)}>
            Filtrer
          </Bouton>
        </form>
      )}

      {erreur && <p className="w-full text-xs font-medium text-red-600">{erreur}</p>}
    </div>
  );
};