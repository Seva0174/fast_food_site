import { useId, useState } from 'react';
import { attributsErreur, classeChamp, classeLabel, classeSousFormulaire, classeTitreSection } from '@/components/admin/carte/classes';
import { ErreurChamp } from '@/components/admin/carte/ErreurChamp';
import { Bouton } from '@/components/ui/bouton';
import { useSignalerEdition } from '@/hooks/useEditionsEnCours';
import { useEnvoi } from '@/hooks/useEnvoi';
import { FORMULAIRE_GROUPE_VIDE, construirePayloadGroupe, erreursGroupe } from '@/lib/options';

// Formulaire de création d'un groupe (nom, sélection minimale et maximale).
// Les erreurs de saisie s'affichent sous leur champ ; onCreer reçoit le formulaire
// et renvoie true si le groupe a été créé.
// onAnnuler (facultatif) : affiche un bouton pour refermer le formulaire.
export const FormulaireGroupe = ({
  titre,
  placeholderNom,
  libelleBouton,
  libelleNom = 'Nom du groupe',
  libelleMin = 'Choix minimum',
  aideMin = '0 = facultatif',
  libelleMax = 'Choix maximum',
  onCreer,
  onAnnuler,
}) => {
  const id = useId();
  const [formulaire, setFormulaire] = useState(FORMULAIRE_GROUPE_VIDE);
  const [erreurs, setErreurs] = useState({});
  const { enCours, lancer } = useEnvoi();
  // Un nom saisi compte comme une modification en cours (fermer la modale demandera confirmation)
  useSignalerEdition(formulaire.nom.trim() !== '');

  const modifier = (champ) => (e) => {
    setFormulaire({ ...formulaire, [champ]: e.target.value });
    if (erreurs[champ]) setErreurs({ ...erreurs, [champ]: undefined });
  };

  const soumettre = async (e) => {
    e.preventDefault();
    const nouvelles = erreursGroupe(construirePayloadGroupe(formulaire)) ?? {};
    setErreurs(nouvelles);
    const premier = ['nom', 'minSelection', 'maxSelection'].find((champ) => nouvelles[champ]);
    if (premier) return document.getElementById(`${id}-${premier}`)?.focus();

    if (await lancer(() => onCreer(formulaire))) setFormulaire(FORMULAIRE_GROUPE_VIDE);
  };

  const champNombre = (champ, libelle, aide, min) => (
    <div>
      <label htmlFor={`${id}-${champ}`} className={classeLabel}>
        {libelle}
        {aide && <span className="font-normal"> ({aide})</span>}
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
    <form onSubmit={soumettre} noValidate aria-labelledby={`${id}-titre`} className={classeSousFormulaire}>
      <h3 id={`${id}-titre`} className={classeTitreSection}>
        {titre}
      </h3>
      <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={`${id}-nom`} className={classeLabel}>
            {libelleNom}
          </label>
          <input
            id={`${id}-nom`}
            type="text"
            autoComplete="off"
            placeholder={placeholderNom}
            value={formulaire.nom}
            onChange={modifier('nom')}
            className={`${classeChamp} bg-card`}
            {...attributsErreur(erreurs, 'nom', id)}
          />
          <ErreurChamp id={`${id}-erreur-nom`} message={erreurs.nom} />
        </div>
        {champNombre('minSelection', libelleMin, aideMin, 0)}
        {champNombre('maxSelection', libelleMax, '', 1)}
      </div>
      <div className="flex justify-end gap-2">
        {onAnnuler && (
          <Bouton variante="secondaire" taille="sm" onClick={onAnnuler}>
            Annuler
          </Bouton>
        )}
        <Bouton type="submit" taille="sm" disabled={enCours}>
          {enCours ? 'Création…' : libelleBouton}
        </Bouton>
      </div>
    </form>
  );
};
