import { estRadio, libelleTypeGroupe } from '../../lib/options';
import { ChoixOption, Surcout } from './ChoixOption';

// niveauTitre : 3 directement sous le titre de la modale, 4 sous un titre d'etape (menu)
export const GroupeOptions = ({ groupe, choisis, erreur, onChoisir, niveauTitre = 3 }) => {
  const Titre = `h${niveauTitre}`;
  const radio = estRadio(groupe);
  // Maximum atteint : les options non choisies sont desactivees (on peut encore en retirer une)
  const maxAtteint = !radio && choisis.length >= groupe.maxSelection;

  return (
    <section
      id={`section-groupe-${groupe.id}`}
      data-zone-erreur={erreur ? 'true' : undefined}
      className={`scroll-mt-4 rounded-xl border p-3.5 transition-colors ${
        erreur ? 'border-destructive/60 bg-destructive/5' : 'border-border bg-secondary/30'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <Titre id={`groupe-options-${groupe.id}`} className="text-sm font-bold">
          {groupe.nom}
        </Titre>
        <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-muted-foreground">
          {libelleTypeGroupe(groupe)}
        </span>
      </div>

      <div
        role={radio ? 'radiogroup' : 'group'}
        aria-labelledby={`groupe-options-${groupe.id}`}
        className="mt-3 space-y-2"
      >
        {groupe.options.length === 0 ? (
          <p className="text-xs italic text-muted-foreground">Aucune option disponible.</p>
        ) : (
          groupe.options.map((item) => (
            <ChoixOption
              key={item.id}
              libelle={item.nom}
              actif={choisis.includes(item.id)}
              radio={radio}
              desactive={maxAtteint && !choisis.includes(item.id)}
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
};