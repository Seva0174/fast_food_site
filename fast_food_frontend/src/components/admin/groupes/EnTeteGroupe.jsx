import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import { attributsErreur, classeBadge, classeChamp } from '@/components/admin/carte/classes';
import { ErreurChamp } from '@/components/admin/carte/ErreurChamp';
import { Bouton } from '@/components/ui/bouton';
import { useEditionExclusive } from '@/hooks/useEditionsEnCours';
import { useEnvoi } from '@/hooks/useEnvoi';
import { construirePayloadGroupe, erreursGroupe, libelleRegleGroupe } from '@/lib/options';

const classeLabelCompact = 'mb-1 block text-xs font-medium text-muted-foreground';

// En-tête d'un groupe : nom, règle de choix, et modification en place.
// avecOrdre : emplacement de menu, affiché à sa position (1, 2, 3...) avec des flèches pour le déplacer.
// position, onDeplacer(sens), premier, dernier : utilisés avec avecOrdre (sens -1 : monter, 1 : descendre).
// onModifier reçoit (idGroupe, formulaire) et renvoie true si le groupe a été modifié.
// Édition : Entrée enregistre, les erreurs s'affichent sous leur champ ; le focus revient ensuite au crayon.
export const EnTeteGroupe = ({
  groupe,
  avecOrdre = false,
  position,
  premier = false,
  dernier = false,
  onDeplacer,
  onModifier,
  onSupprimer,
}) => {
  const id = useId();
  const { ouverte: enEdition, ailleurs, ouvrir, fermer, attente } = useEditionExclusive();
  const [formulaire, setFormulaire] = useState(null);
  const [erreurs, setErreurs] = useState({});
  const { enCours, lancer } = useEnvoi();
  const crayon = useRef(null);
  const rendreFocus = useRef(false);

  useEffect(() => {
    if (enEdition || !rendreFocus.current) return;
    rendreFocus.current = false;
    crayon.current?.focus();
  }, [enEdition]);

  const terminerEdition = () => {
    rendreFocus.current = true;
    fermer();
  };

  const demarrerEdition = () => {
    setFormulaire({
      nom: groupe.nom,
      minSelection: groupe.minSelection,
      maxSelection: groupe.maxSelection,
      ...(avecOrdre && { ordre: groupe.ordre }),
    });
    setErreurs({});
    ouvrir();
  };

  const enregistrer = async (e) => {
    e.preventDefault();
    const nouvelles = erreursGroupe(construirePayloadGroupe(formulaire)) ?? {};
    setErreurs(nouvelles);
    const champEnErreur = ['nom', 'minSelection', 'maxSelection'].find((champ) => nouvelles[champ]);
    if (champEnErreur) return document.getElementById(`${id}-${champEnErreur}`)?.focus();

    if (await lancer(() => onModifier(groupe.id, formulaire))) terminerEdition();
  };

  const modifier = (champ) => (e) => {
    setFormulaire({ ...formulaire, [champ]: e.target.value });
    if (erreurs[champ]) setErreurs({ ...erreurs, [champ]: undefined });
  };

  if (enEdition) {
    const champNombre = (champ, libelle, min) => (
      <div className="w-28">
        <label htmlFor={`${id}-${champ}`} className={classeLabelCompact}>
          {libelle}
        </label>
        <input
          id={`${id}-${champ}`}
          type="number"
          min={min}
          value={formulaire[champ]}
          onChange={modifier(champ)}
          className={`${classeChamp} bg-card tabular-nums`}
          {...attributsErreur(erreurs, champ, id)}
        />
        <ErreurChamp id={`${id}-erreur-${champ}`} message={erreurs[champ]} />
      </div>
    );

    return (
      <form onSubmit={enregistrer} noValidate className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <div className="flex flex-1 flex-wrap items-start gap-3">
          <div className="min-w-48 flex-1">
            <label htmlFor={`${id}-nom`} className={classeLabelCompact}>
              Nom
            </label>
            <input
              id={`${id}-nom`}
              type="text"
              autoFocus
              autoComplete="off"
              value={formulaire.nom}
              onChange={modifier('nom')}
              className={`${classeChamp} bg-card font-semibold`}
              {...attributsErreur(erreurs, 'nom', id)}
            />
            <ErreurChamp id={`${id}-erreur-nom`} message={erreurs.nom} />
          </div>
          {champNombre('minSelection', 'Choix min.', 0)}
          {champNombre('maxSelection', 'Choix max.', 1)}
        </div>
        <div className="flex items-center justify-end gap-2 lg:mt-5">
          <Bouton variante="secondaire" taille="sm" className="min-h-10" onClick={terminerEdition}>
            Annuler
          </Bouton>
          <Bouton type="submit" taille="sm" className="min-h-10" disabled={enCours}>
            {enCours ? 'Enregistrement…' : 'Enregistrer'}
          </Bouton>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="text-base font-semibold text-foreground">
          {avecOrdre && <span className="mr-2 tabular-nums text-muted-foreground">{position}.</span>}
          {groupe.nom}
        </h3>
        <span className={classeBadge}>{libelleRegleGroupe(groupe)}</span>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {/* aria-disabled plutôt que disabled : le focus reste sur la flèche arrivée en bout de liste */}
        {avecOrdre && (
          <>
            <Bouton
              variante="fantome"
              taille="nu"
              className="size-9 aria-disabled:cursor-not-allowed aria-disabled:opacity-40"
              aria-disabled={premier}
              onClick={() => !premier && onDeplacer(-1)}
              aria-label={`Monter ${groupe.nom}`}
              title="Monter"
            >
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            </Bouton>
            <Bouton
              variante="fantome"
              taille="nu"
              className="size-9 aria-disabled:cursor-not-allowed aria-disabled:opacity-40"
              aria-disabled={dernier}
              onClick={() => !dernier && onDeplacer(1)}
              aria-label={`Descendre ${groupe.nom}`}
              title="Descendre"
            >
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </Bouton>
          </>
        )}
        <Bouton
          ref={crayon}
          variante="fantome"
          taille="nu"
          className="size-9"
          onClick={() => !ailleurs && demarrerEdition()}
          aria-label={`Modifier ${groupe.nom}`}
          title="Modifier"
          {...attente(ailleurs)}
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </Bouton>
        <Bouton
          variante="fantomeDanger"
          taille="nu"
          className="size-9"
          onClick={() => !ailleurs && onSupprimer(groupe)}
          aria-label={`Supprimer ${groupe.nom}`}
          title="Supprimer"
          {...attente(ailleurs)}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Bouton>
      </div>
    </div>
  );
};
