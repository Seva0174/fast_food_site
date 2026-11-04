import { useId, useRef, useState } from 'react';
import { Bouton } from '@/components/ui/bouton';
import { ListeDeroulante } from '@/components/ui/liste';
import { useSignalerEdition } from '@/hooks/useEditionsEnCours';
import { useEnvoi } from '@/hooks/useEnvoi';
import { FORMULAIRE_OPTION_VIDE, construirePayloadOption, erreursOption, proposerNomOption } from '@/lib/options';
import { attributsErreur, classeChamp, classeLabel, classeListe, classeSousFormulaire, classeTitreSection } from './classes';
import { ErreurChamp } from './ErreurChamp';

// Valeur de la liste pour « aucun ingrédient » (une liste Radix n'accepte pas de valeur vide)
const AUCUN = 'aucun';

// Formulaire d'une option, pour l'ajout comme pour la modification.
// continuer : après un ajout, le formulaire se vide et reste ouvert pour la saisie suivante (« Terminer » le ferme).
// L'ingrédient du stock est facultatif : sans lui, l'option ne retire rien du stock (ex : une sauce non suivie).
// Les erreurs de saisie s'affichent sous leur champ ; onSoumettre reçoit le formulaire
// et renvoie true si l'enregistrement a réussi.
export const FormulaireOption = ({
  matieresPremieres,
  initial = FORMULAIRE_OPTION_VIDE,
  titre,
  libelleBouton,
  continuer = false,
  onSoumettre,
  onAnnuler,
}) => {
  const id = useId();
  const [formulaire, setFormulaire] = useState(initial);
  const [erreurs, setErreurs] = useState({});
  const { enCours, lancer } = useEnvoi();
  const champNom = useRef(null);
  const champQuantite = useRef(null);
  const champSurcout = useRef(null);
  useSignalerEdition(true);

  const matiereChoisie = matieresPremieres.find((m) => String(m.id) === formulaire.idMatiere);

  // Efface l'erreur d'un champ dès qu'on le modifie
  const changer = (changement) => {
    setFormulaire((prev) => ({ ...prev, ...changement }));
    setErreurs((prev) => {
      const suivantes = { ...prev };
      Object.keys(changement).forEach((champ) => delete suivantes[champ]);
      return suivantes;
    });
  };
  const modifier = (champ) => (e) => changer({ [champ]: e.target.value });

  // Le nom suit la matière choisie tant qu'il n'a pas été personnalisé
  const changerMatiere = (valeur) => {
    const idMatiere = valeur === AUCUN ? '' : valeur;
    const choisie = matieresPremieres.find((m) => String(m.id) === idMatiere);
    changer({
      idMatiere,
      nom: proposerNomOption(formulaire.nom, matiereChoisie?.nom ?? '', choisie?.nom ?? formulaire.nom),
    });
  };

  const soumettre = async (e) => {
    e.preventDefault();
    const nouvelles = erreursOption(construirePayloadOption(formulaire)) ?? {};
    setErreurs(nouvelles);
    if (nouvelles.nom) return champNom.current?.focus();
    if (nouvelles.quantiteDeduite) return champQuantite.current?.focus();
    if (nouvelles.surcout) return champSurcout.current?.focus();

    if (!(await lancer(() => onSoumettre(formulaire)))) return;
    if (!continuer) return onAnnuler();
    // Saisie suivante : formulaire vide, focus sur le premier champ
    setFormulaire(FORMULAIRE_OPTION_VIDE);
    setErreurs({});
    document.getElementById(`${id}-idMatiere`)?.focus();
  };

  const proprietesErreur = (champ) => attributsErreur(erreurs, champ, id);

  return (
    <form onSubmit={soumettre} noValidate aria-labelledby={`${id}-titre`} className={classeSousFormulaire}>
      <h4 id={`${id}-titre`} className={classeTitreSection}>
        {titre}
      </h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-idMatiere`} className={classeLabel}>
            Ingrédient du stock <span className="font-normal">(facultatif)</span>
          </label>
          <ListeDeroulante
            id={`${id}-idMatiere`}
            valeur={formulaire.idMatiere || AUCUN}
            onChange={changerMatiere}
            options={[
              { value: AUCUN, label: 'Aucun (rien retiré du stock)' },
              ...matieresPremieres.map((m) => ({ value: m.id, label: m.nom })),
            ]}
            className={`${classeListe} bg-card`}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-nom`} className={classeLabel}>
            Nom affiché au client
          </label>
          <input
            id={`${id}-nom`}
            ref={champNom}
            type="text"
            autoFocus
            autoComplete="off"
            value={formulaire.nom}
            onChange={modifier('nom')}
            className={`${classeChamp} bg-card`}
            {...proprietesErreur('nom')}
          />
          <ErreurChamp id={`${id}-erreur-nom`} message={erreurs.nom} />
          {!erreurs.nom && (
            <p className="mt-1 text-xs text-muted-foreground">Repris de l'ingrédient tant que tu ne le changes pas.</p>
          )}
        </div>
        {matiereChoisie && (
          <div className="sm:col-span-2">
            <label htmlFor={`${id}-quantite`} className={classeLabel}>
              Retiré du stock à chaque vente{matiereChoisie.uniteMesure ? ` (${matiereChoisie.uniteMesure})` : ''}
            </label>
            <input
              id={`${id}-quantite`}
              ref={champQuantite}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              value={formulaire.quantiteDeduite}
              onChange={modifier('quantiteDeduite')}
              className={`${classeChamp} bg-card tabular-nums`}
              {...proprietesErreur('quantiteDeduite')}
            />
            <ErreurChamp id={`${id}-erreur-quantiteDeduite`} message={erreurs.quantiteDeduite} />
          </div>
        )}
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-surcout`} className={classeLabel}>
            Surcoût (€, 0 = gratuit)
          </label>
          <input
            id={`${id}-surcout`}
            ref={champSurcout}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={formulaire.surcout}
            onChange={modifier('surcout')}
            className={`${classeChamp} bg-card tabular-nums`}
            {...proprietesErreur('surcout')}
          />
          <ErreurChamp id={`${id}-erreur-surcout`} message={erreurs.surcout} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Bouton variante="secondaire" taille="sm" onClick={onAnnuler}>
          {continuer ? 'Terminer' : 'Annuler'}
        </Bouton>
        <Bouton type="submit" taille="sm" disabled={enCours}>
          {enCours ? 'Enregistrement…' : libelleBouton}
        </Bouton>
      </div>
    </form>
  );
};
