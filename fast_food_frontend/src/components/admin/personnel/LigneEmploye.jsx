import { useState } from 'react';
import { Bouton } from '@/components/ui/bouton';
import { ListeDeroulante } from '@/components/ui/liste';
import { ROLES_RH, ROLES_SYSTEME } from '@/lib/personnel';
import { ROLE } from '@/lib/roles';

// Une ligne du tableau des employés, avec son propre mode édition.
// estMonCompte : le compte connecté ne peut ni changer son rôle système ni se supprimer.
export const LigneEmploye = ({
  employe,
  selectionne,
  estMonCompte,
  onModifier,
  onGererHeures,
  onSupprimer,
}) => {
  const [enEdition, setEnEdition] = useState(false);
  const [nom, setNom] = useState('');
  const [roleSysteme, setRoleSysteme] = useState('');
  const [roleRH, setRoleRH] = useState('');
  const [salaireHeure, setSalaireHeure] = useState('');

  const demarrerEdition = () => {
    setNom(employe.nom);
    setRoleSysteme(employe.roleSysteme);
    setRoleRH(employe.role);
    setSalaireHeure(employe.salaireHeure);
    setEnEdition(true);
  };

  const sauvegarder = async () => {
    const reussi = await onModifier(employe.id, {
      nom,
      email: employe.email,
      roleSysteme,
      role: roleRH,
      salaireHeure: parseFloat(salaireHeure),
    });
    if (reussi) setEnEdition(false);
  };

  const badgeRoleSysteme = (
    <span
      className={`rounded px-2 py-0.5 text-xs font-semibold ${
        employe.roleSysteme === ROLE.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
      }`}
    >
      {employe.roleSysteme}
    </span>
  );

  return (
    <tr className={`transition-colors hover:bg-gray-50 ${selectionne ? 'bg-red-50 font-medium' : ''}`}>
      <td className="p-3">
        {enEdition ? (
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full rounded border px-2 py-1 text-sm"
          />
        ) : (
          employe.nom
        )}
      </td>

      <td className="p-3 text-gray-600">{employe.email}</td>

      <td className="p-3">
        {enEdition && !estMonCompte ? (
          <ListeDeroulante
            valeur={roleSysteme}
            onChange={setRoleSysteme}
            options={ROLES_SYSTEME}
            className="min-w-[8rem] rounded border px-2 py-1"
          />
        ) : (
          badgeRoleSysteme
        )}
      </td>

      <td className="p-3">
        {enEdition ? (
          <ListeDeroulante
            valeur={roleRH}
            onChange={setRoleRH}
            options={ROLES_RH}
            className="min-w-[8rem] rounded border px-2 py-1"
          />
        ) : (
          <span className="rounded-full border bg-gray-100 px-2 py-1 text-xs">{employe.role}</span>
        )}
      </td>

      <td className="p-3">
        {enEdition ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="0.01"
              min="0"
              value={salaireHeure}
              onChange={(e) => setSalaireHeure(e.target.value)}
              className="w-20 rounded border px-2 py-1 text-sm"
            />
            <span>€/h</span>
          </div>
        ) : (
          `${employe.salaireHeure.toFixed(2)} € / h`
        )}
      </td>

      <td className="p-3">
        <div className="flex items-center justify-end gap-2">
          {enEdition ? (
            <>
              <Bouton variante="succes" taille="xs" onClick={sauvegarder}>
                Enregistrer
              </Bouton>
              <Bouton variante="neutre" taille="xs" onClick={() => setEnEdition(false)}>
                Annuler
              </Bouton>
            </>
          ) : (
            <>
              <Bouton variante="info" taille="xs" onClick={demarrerEdition}>
                Modifier
              </Bouton>
              <Bouton variante="sombre" taille="xs" onClick={() => onGererHeures(employe)}>
                Gérer Heures
              </Bouton>
              <Bouton
                taille="xs"
                disabled={estMonCompte}
                title={estMonCompte ? 'Vous ne pouvez pas supprimer votre propre compte' : undefined}
                onClick={() => onSupprimer(employe)}
              >
                Licencier
              </Bouton>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};