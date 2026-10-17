import { ROLE } from '@/lib/roles';


export const ROLES_SYSTEME = [
  { value: ROLE.EMPLOYE, label: 'Employé' },
  { value: ROLE.ADMIN, label: 'Administrateur' },
];

export const ROLE_SYSTEME_PAR_DEFAUT = ROLE.EMPLOYE;

export const ROLES_RH = [
  { value: 'CUISINIER', label: 'Cuisinier' },
  { value: 'CAISSIER', label: 'Caissier' },
  { value: 'MANAGER', label: 'Manager' },
];

export const ROLE_RH_PAR_DEFAUT = 'CUISINIER';

export const DOMAINE_EMAIL_PRO = '@tacoburger.fr';

export const HEURES_MAX_PAR_JOUR = 24;

export const MOIS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(0, i).toLocaleString('fr-FR', { month: 'long' }),
}));

// Renvoie le message d'erreur d'un email professionnel invalide, ou null s'il est valide.
export const erreurEmailPro = (email) =>
  email.trim().toLowerCase().endsWith(DOMAINE_EMAIL_PRO)
    ? null
    : `L'adresse email doit impérativement se terminer par ${DOMAINE_EMAIL_PRO}`;

// Vrai si l'employé est le compte actuellement connecté (comparaison par email).
export const estSonCompte = (employe, emailConnecte) =>
  Boolean(emailConnecte) && employe.email?.toLowerCase() === emailConnecte.toLowerCase();

// Convertit une saisie heures + minutes en heures décimales (7 h 20 donne 7,3333).
export const heuresEnDecimal = (heures, minutes) =>
  (parseInt(heures, 10) || 0) + (parseInt(minutes, 10) || 0) / 60;

// Renvoie le message d'erreur d'une durée journalière invalide, ou null si elle est valide.
export const erreurSaisieHeures = (total) =>
  total <= 0 || total > HEURES_MAX_PAR_JOUR
    ? `Le nombre d'heures par jour doit être entre 0 et ${HEURES_MAX_PAR_JOUR}h.`
    : null;

// Affiche des heures décimales sous la forme "7h 20min".
export const formaterHeures = (valeurDecimale) => {
  const totalMinutes = Math.round(valeurDecimale * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h}h ${m < 10 ? '0' : ''}${m}min` : `${h}h`;
};