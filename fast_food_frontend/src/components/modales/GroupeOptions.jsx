import { estRadio, libelleTypeGroupe } from '../../lib/options';
import { ChoixOption, Surcout } from './ChoixOption';

export const GroupeOptions = ({ groupe, choisis, erreur, onChoisir }) => (
  <section className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5">
    <div className="mb-2 flex items-center justify-between">
      <h4 className="text-sm font-bold text-gray-800">{groupe.nom}</h4>
      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
        {libelleTypeGroupe(groupe)}
      </span>
    </div>

    <div className="mt-3 space-y-2">
      {groupe.options.length === 0 ? (
        <p className="text-xs italic text-gray-400">Aucune option disponible.</p>
      ) : (
        groupe.options.map((item) => (
          <ChoixOption
            key={item.id}
            libelle={item.nom}
            actif={choisis.includes(item.id)}
            radio={estRadio(groupe)}
            droite={<Surcout valeur={item.surcout} />}
            onClick={() => onChoisir(groupe, item.id)}
          />
        ))
      )}
    </div>

    {erreur && (
      <p role="alert" className="mt-2 text-xs font-semibold text-red-600">
        {erreur}
      </p>
    )}
  </section>
);