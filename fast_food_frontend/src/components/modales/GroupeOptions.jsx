import { estRadio, libelleTypeGroupe } from '../../lib/options';
import { ChoixOption, Surcout } from './ChoixOption';

export const GroupeOptions = ({ groupe, choisis, erreur, onChoisir }) => (
  <section className="rounded-xl border border-border bg-secondary/30 p-3.5">
    <div className="mb-2 flex items-center justify-between">
      <h4 className="text-sm font-bold">{groupe.nom}</h4>
      <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
        {libelleTypeGroupe(groupe)}
      </span>
    </div>

    <div className="mt-3 space-y-2">
      {groupe.options.length === 0 ? (
        <p className="text-xs italic text-muted-foreground">Aucune option disponible.</p>
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
      <p role="alert" className="mt-2 text-xs font-semibold text-destructive">
        {erreur}
      </p>
    )}
  </section>
);