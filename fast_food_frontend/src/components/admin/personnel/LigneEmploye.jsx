import { useEffect, useRef, useState } from 'react';
import { Clock, Pencil, ShieldCheck, UserMinus } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { ListeDeroulante } from '@/components/ui/liste';
import {
  ROLES_RH,
  ROLES_SYSTEME,
  erreursEmploye,
  formaterTaux,
  libelleRoleRH,
  libelleRoleSysteme,
} from '@/lib/personnel';
import { ROLE } from '@/lib/roles';

const classeChamp =
  'w-full min-h-10 rounded-lg border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive';

const classeBadge =
  'inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground';

// Message d'erreur sous un champ de la ligne en édition
const ErreurChamp = ({ id, message }) =>
  message ? (
    <p id={id} className="mt-1 text-xs font-medium text-destructive">
      {message}
    </p>
  ) : null;

// Une ligne du tableau des employés. Une seule ligne est en édition à la fois (enEdition, piloté
// par le tableau) : pendant ce temps, les crayons des autres lignes sont inactifs (editionAilleurs).
// Édition : Entrée enregistre, Échap annule (depuis n'importe quel champ ou bouton de la ligne) ;
// le focus revient ensuite au crayon.
// estMonCompte : le compte connecté ne peut ni changer son accès ni se retirer de l'équipe.
export const LigneEmploye = ({
  employe,
  selectionne,
  estMonCompte,
  enEdition,
  editionAilleurs,
  onEditer,
  onModifier,
  onGererHeures,
  onSupprimer,
}) => {
  const [nom, setNom] = useState('');
  const [roleSysteme, setRoleSysteme] = useState('');
  const [roleRH, setRoleRH] = useState('');
  const [salaireHeure, setSalaireHeure] = useState('');
  const [erreurs, setErreurs] = useState(null);
  const crayon = useRef(null);
  const champNom = useRef(null);
  const champTaux = useRef(null);
  // Vrai quand la ligne termine elle-même son édition (et pas quand une autre ligne la remplace)
  const rendreFocus = useRef(false);

  // Fin de l'édition (enregistrée ou annulée) : le focus revient au crayon de la ligne
  useEffect(() => {
    if (enEdition || !rendreFocus.current) return;
    rendreFocus.current = false;
    crayon.current?.focus();
  }, [enEdition]);

  const terminerEdition = () => {
    rendreFocus.current = true;
    onEditer(null);
  };

  const demarrerEdition = () => {
    setNom(employe.nom);
    setRoleSysteme(employe.roleSysteme);
    setRoleRH(employe.role);
    setSalaireHeure(employe.salaireHeure ?? '');
    setErreurs(null);
    onEditer(employe.id);
  };

  const sauvegarder = async () => {
    const nouvellesErreurs = erreursEmploye({ nom, salaireHeure });
    setErreurs(nouvellesErreurs);
    if (nouvellesErreurs) {
      (nouvellesErreurs.nom ? champNom : champTaux).current?.focus();
      return;
    }

    const reussi = await onModifier(employe.id, {
      nom: nom.trim(),
      email: employe.email,
      roleSysteme,
      role: roleRH,
      salaireHeure: parseFloat(salaireHeure),
    });
    if (reussi) terminerEdition();
  };

  const raccourcisEdition = (e) => {
    if (e.key === 'Enter') sauvegarder();
  };

  // Échap annule l'édition depuis un champ, une liste ou un bouton de la ligne. Les options d'une
  // liste ouverte sont dans un portail (hors de la ligne) : Échap ne ferme alors que la liste.
  const surToucheLigne = (e) => {
    if (enEdition && e.key === 'Escape' && e.currentTarget.contains(e.target) && !e.defaultPrevented) {
      terminerEdition();
    }
  };

  const idErreurNom = `erreur-nom-${employe.id}`;
  const idErreurTaux = `erreur-taux-${employe.id}`;

  return (
    <tr
      onKeyDown={surToucheLigne}
      className={`align-top transition-colors ${selectionne ? 'bg-muted/50' : 'hover:bg-muted/50'}`}
    >
      <th scope="row" className="p-3 text-left font-medium">
        {enEdition ? (
          <>
            <input
              ref={champNom}
              type="text"
              autoFocus
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              onKeyDown={raccourcisEdition}
              aria-label={`Nom de ${employe.nom}`}
              aria-invalid={Boolean(erreurs?.nom)}
              aria-describedby={erreurs?.nom ? idErreurNom : undefined}
              className={classeChamp}
            />
            <ErreurChamp id={idErreurNom} message={erreurs?.nom} />
          </>
        ) : (
          <span className="block break-words pt-2">
            {employe.nom}
            {estMonCompte && <span className="ml-2 text-sm font-normal text-muted-foreground">(toi)</span>}
          </span>
        )}
      </th>

      <td className="p-3 text-muted-foreground">
        <span className="block truncate pt-2" title={employe.email}>
          {employe.email}
        </span>
      </td>

      <td className="p-3">
        {enEdition && !estMonCompte ? (
          <ListeDeroulante
            valeur={roleSysteme}
            onChange={setRoleSysteme}
            options={ROLES_SYSTEME}
            ariaLabel={`Accès au site de ${employe.nom}`}
            className="min-h-10 w-full rounded-lg border border-input px-3"
          />
        ) : (
          <span className={`${classeBadge} mt-[7px]`}>
            {employe.roleSysteme === ROLE.ADMIN && <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />}
            {libelleRoleSysteme(employe.roleSysteme)}
          </span>
        )}
      </td>

      <td className="p-3">
        {enEdition ? (
          <ListeDeroulante
            valeur={roleRH}
            onChange={setRoleRH}
            options={ROLES_RH}
            ariaLabel={`Poste de ${employe.nom}`}
            className="min-h-10 w-full rounded-lg border border-input px-3"
          />
        ) : (
          <span className={`${classeBadge} mt-[7px]`}>{libelleRoleRH(employe.role)}</span>
        )}
      </td>

      <td className="whitespace-nowrap p-3 text-right tabular-nums">
        {enEdition ? (
          <>
            <input
              ref={champTaux}
              type="number"
              step="0.01"
              min="0"
              value={salaireHeure}
              onChange={(e) => setSalaireHeure(e.target.value)}
              onKeyDown={raccourcisEdition}
              aria-label={`Taux horaire de ${employe.nom}, en euros`}
              aria-invalid={Boolean(erreurs?.salaireHeure)}
              aria-describedby={erreurs?.salaireHeure ? idErreurTaux : undefined}
              className={`${classeChamp} text-right tabular-nums`}
            />
            <ErreurChamp id={idErreurTaux} message={erreurs?.salaireHeure} />
          </>
        ) : (
          <span className="block pt-2">{formaterTaux(employe.salaireHeure)}</span>
        )}
      </td>

      <td className="p-3">
        <div className="flex items-center justify-end gap-2">
          {enEdition ? (
            <>
              <Bouton variante="secondaire" taille="sm" onClick={terminerEdition}>
                Annuler
              </Bouton>
              <Bouton variante="sombre" taille="sm" onClick={sauvegarder}>
                Enregistrer
              </Bouton>
            </>
          ) : (
            <>
              <Bouton
                variante={selectionne ? 'sombre' : 'secondaire'}
                taille="sm"
                className="min-h-9 shrink-0 whitespace-nowrap"
                aria-pressed={selectionne}
                data-heures-employe={employe.id}
                onClick={() => onGererHeures(employe)}
                title="Heures et paie"
              >
                <Clock className="h-4 w-4" aria-hidden="true" />
                {/* Sous 1280px, l'icône seule : le tableau tient sans défiler sur un écran de 1024px */}
                <span className="sr-only xl:not-sr-only">Heures et paie</span>
              </Bouton>
              <Bouton
                ref={crayon}
                variante="secondaire"
                taille="nu"
                className="size-9 shrink-0"
                onClick={demarrerEdition}
                disabled={editionAilleurs}
                aria-label={`Modifier ${employe.nom}`}
                title={editionAilleurs ? 'Termine la modification en cours' : 'Modifier'}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </Bouton>
              <Bouton
                variante="fantomeDanger"
                taille="nu"
                className="size-9 shrink-0"
                disabled={estMonCompte}
                onClick={() => onSupprimer(employe)}
                aria-label={
                  estMonCompte
                    ? 'Tu ne peux pas te retirer de l’équipe'
                    : `Retirer ${employe.nom} de l'équipe`
                }
                title={estMonCompte ? 'Tu ne peux pas te retirer de l’équipe' : "Retirer de l'équipe"}
              >
                <UserMinus className="h-4 w-4" aria-hidden="true" />
              </Bouton>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};
