import { useId, useRef, useState } from 'react';
import { ListeDeroulante } from '@/components/ui/liste';
import {
  DOMAINE_EMAIL_PRO,
  ROLES_RH,
  ROLES_SYSTEME,
  ROLE_RH_PAR_DEFAUT,
  ROLE_SYSTEME_PAR_DEFAUT,
  erreurEmailPro,
  erreursEmploye,
} from '@/lib/personnel';

const classeChamp =
  'w-full min-h-10 rounded-lg border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive';
const classeLabel = 'mb-1 block text-sm font-medium text-muted-foreground';
const classeListe = 'w-full min-h-10 rounded-lg border border-input px-3';

// Formulaire d'embauche, affiché dans une modale. Les boutons sont dans le pied de la modale
// et soumettent ce formulaire par son id (idFormulaire).
// onCreer renvoie true si l'employé a été créé.
export const FormulaireEmploye = ({ idFormulaire, onCreer }) => {
  const id = useId();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [mdp, setMdp] = useState('');
  const [roleSysteme, setRoleSysteme] = useState(ROLE_SYSTEME_PAR_DEFAUT);
  const [roleRH, setRoleRH] = useState(ROLE_RH_PAR_DEFAUT);
  const [salaireHeure, setSalaireHeure] = useState('');
  const [erreurs, setErreurs] = useState({});
  const champNom = useRef(null);
  const champEmail = useRef(null);
  const champTaux = useRef(null);

  // Efface l'erreur d'un champ dès qu'on le modifie
  const modifier = (champ, setter) => (e) => {
    setter(e.target.value);
    if (erreurs[champ]) setErreurs((prev) => ({ ...prev, [champ]: undefined }));
  };

  const soumettre = async (e) => {
    e.preventDefault();
    const nouvelles = {
      ...erreursEmploye({ nom, salaireHeure }),
      ...(erreurEmailPro(email) ? { email: erreurEmailPro(email) } : {}),
    };
    setErreurs(nouvelles);
    // Le focus va au premier champ en erreur, dans l'ordre du formulaire
    const premier = [
      ['nom', champNom],
      ['email', champEmail],
      ['salaireHeure', champTaux],
    ].find(([champ]) => nouvelles[champ]);
    if (premier) {
      premier[1].current?.focus();
      return;
    }

    await onCreer({
      nom,
      email: email.trim(),
      mdp,
      roleSysteme,
      role: roleRH,
      salaireHeure: parseFloat(salaireHeure),
    });
  };

  return (
    <form id={idFormulaire} onSubmit={soumettre} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor={`${id}-nom`} className={classeLabel}>
          Nom complet
        </label>
        <input
          id={`${id}-nom`}
          ref={champNom}
          type="text"
          autoFocus
          autoComplete="off"
          placeholder="ex : Jean Dupont"
          value={nom}
          onChange={modifier('nom', setNom)}
          aria-invalid={Boolean(erreurs.nom)}
          aria-describedby={erreurs.nom ? `${id}-nom-erreur` : undefined}
          className={classeChamp}
          required
        />
        {erreurs.nom && (
          <p id={`${id}-nom-erreur`} role="alert" className="mt-1 text-sm font-medium text-destructive">
            {erreurs.nom}
          </p>
        )}
      </div>

      <div className="sm:col-span-2">
        <label htmlFor={`${id}-email`} className={classeLabel}>
          Email professionnel
        </label>
        <input
          id={`${id}-email`}
          ref={champEmail}
          type="email"
          autoComplete="off"
          placeholder={`nom${DOMAINE_EMAIL_PRO}`}
          value={email}
          onChange={modifier('email', setEmail)}
          aria-invalid={Boolean(erreurs.email)}
          aria-describedby={`${id}-email-aide${erreurs.email ? ` ${id}-email-erreur` : ''}`}
          className={classeChamp}
          required
        />
        <p id={`${id}-email-aide`} className="mt-1 text-sm text-muted-foreground">
          L'adresse doit se terminer par {DOMAINE_EMAIL_PRO}.
        </p>
        {erreurs.email && (
          <p id={`${id}-email-erreur`} role="alert" className="mt-1 text-sm font-medium text-destructive">
            {erreurs.email}
          </p>
        )}
      </div>

      <div className="sm:col-span-2">
        <label htmlFor={`${id}-mdp`} className={classeLabel}>
          Mot de passe provisoire
        </label>
        <input
          id={`${id}-mdp`}
          type="password"
          autoComplete="new-password"
          value={mdp}
          onChange={(e) => setMdp(e.target.value)}
          className={classeChamp}
          required
        />
      </div>

      <div>
        <label htmlFor={`${id}-acces`} className={classeLabel}>
          Accès au site
        </label>
        <ListeDeroulante
          id={`${id}-acces`}
          valeur={roleSysteme}
          onChange={setRoleSysteme}
          options={ROLES_SYSTEME}
          className={classeListe}
        />
      </div>

      <div>
        <label htmlFor={`${id}-poste`} className={classeLabel}>
          Poste
        </label>
        <ListeDeroulante
          id={`${id}-poste`}
          valeur={roleRH}
          onChange={setRoleRH}
          options={ROLES_RH}
          className={classeListe}
        />
      </div>

      <div>
        <label htmlFor={`${id}-taux`} className={classeLabel}>
          Taux horaire (€)
        </label>
        <input
          id={`${id}-taux`}
          ref={champTaux}
          type="number"
          step="0.01"
          min="0"
          placeholder="12,50"
          value={salaireHeure}
          onChange={modifier('salaireHeure', setSalaireHeure)}
          aria-invalid={Boolean(erreurs.salaireHeure)}
          aria-describedby={erreurs.salaireHeure ? `${id}-taux-erreur` : undefined}
          className={`${classeChamp} tabular-nums`}
          required
        />
        {erreurs.salaireHeure && (
          <p id={`${id}-taux-erreur`} role="alert" className="mt-1 text-sm font-medium text-destructive">
            {erreurs.salaireHeure}
          </p>
        )}
      </div>
    </form>
  );
};
