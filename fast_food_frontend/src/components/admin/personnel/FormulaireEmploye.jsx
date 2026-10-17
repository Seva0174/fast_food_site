import { useState } from 'react';
import { Bouton } from '@/components/ui/bouton';
import { ListeDeroulante } from '@/components/ui/liste';
import {
  ROLES_RH,
  ROLES_SYSTEME,
  ROLE_RH_PAR_DEFAUT,
  ROLE_SYSTEME_PAR_DEFAUT,
  erreurEmailPro,
} from '@/lib/personnel';

const classeChamp =
  'w-full rounded border border-gray-300 px-2.5 py-1.5 text-sm focus:ring-1 focus:ring-red-500';
const classeLabel = 'mb-1 block text-xs font-semibold text-gray-600';

// Formulaire d'embauche. onCreer renvoie true si l'employé a été créé.
export const FormulaireEmploye = ({ onCreer }) => {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [mdp, setMdp] = useState('');
  const [roleSysteme, setRoleSysteme] = useState(ROLE_SYSTEME_PAR_DEFAUT);
  const [roleRH, setRoleRH] = useState(ROLE_RH_PAR_DEFAUT);
  const [salaireHeure, setSalaireHeure] = useState('');
  const [erreurEmail, setErreurEmail] = useState('');

  const soumettre = async (e) => {
    e.preventDefault();
    const erreur = erreurEmailPro(email);
    setErreurEmail(erreur ?? '');
    if (erreur) return;

    const cree = await onCreer({
      nom,
      email: email.trim(),
      mdp,
      roleSysteme,
      role: roleRH,
      salaireHeure: parseFloat(salaireHeure),
    });

    if (cree) {
      setNom('');
      setEmail('');
      setMdp('');
      setRoleSysteme(ROLE_SYSTEME_PAR_DEFAUT);
      setRoleRH(ROLE_RH_PAR_DEFAUT);
      setSalaireHeure('');
    }
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-gray-800">Embaucher un nouvel employé</h2>
      <form onSubmit={soumettre} className="grid grid-cols-1 gap-3 md:grid-cols-6">
        <div>
          <label className={classeLabel}>Nom complet</label>
          <input
            type="text"
            placeholder="ex: Jean Dupont"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className={classeChamp}
            required
          />
        </div>
        <div>
          <label className={classeLabel}>Email pro</label>
          <input
            type="email"
            placeholder="nom@tacoburger.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={classeChamp}
            required
          />
        </div>
        <div>
          <label className={classeLabel}>Mot de passe</label>
          <input
            type="password"
            placeholder="Mot de passe"
            value={mdp}
            onChange={(e) => setMdp(e.target.value)}
            className={classeChamp}
            required
          />
        </div>
        <div>
          <label className={classeLabel}>Accès Système</label>
          <ListeDeroulante
            valeur={roleSysteme}
            onChange={setRoleSysteme}
            options={ROLES_SYSTEME}
            className="w-full rounded border border-gray-300 px-2.5 py-1.5"
          />
        </div>
        <div>
          <label className={classeLabel}>Poste RH</label>
          <ListeDeroulante
            valeur={roleRH}
            onChange={setRoleRH}
            options={ROLES_RH}
            className="w-full rounded border border-gray-300 px-2.5 py-1.5"
          />
        </div>
        <div>
          <label className={classeLabel}>Taux (€/h)</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="12.50"
              value={salaireHeure}
              onChange={(e) => setSalaireHeure(e.target.value)}
              className={classeChamp}
              required
            />
            <Bouton type="submit" taille="sm" className="px-3 py-1.5">
              Créer
            </Bouton>
          </div>
        </div>
      </form>
      {erreurEmail && <p className="mt-2 text-xs font-semibold text-red-500">{erreurEmail}</p>}
    </div>
  );
};