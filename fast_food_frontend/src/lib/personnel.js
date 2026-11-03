import { ajouterJours, aujourdhuiIso } from '@/lib/periode';
import { formaterPrix } from '@/lib/prix';
import { ROLE } from '@/lib/roles';

export const ROLES_SYSTEME = [
  { value: ROLE.EMPLOYE, label: 'Employé', description: 'Gère les commandes' },
  { value: ROLE.ADMIN, label: 'Administrateur', description: 'Commandes et administration' },
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

// Renvoie le message d'erreur d'un email professionnel invalide, ou null s'il est valide.
export const erreurEmailPro = (email) =>
  email.trim().toLowerCase().endsWith(DOMAINE_EMAIL_PRO)
    ? null
    : `Utilisez une adresse qui se termine par ${DOMAINE_EMAIL_PRO}.`;

// Erreurs de la modification d'un employé, par champ ({ nom, salaireHeure }), ou null si tout est valide.
export const erreursEmploye = ({ nom, salaireHeure }) => {
  const erreurs = {};
  if (!nom.trim()) erreurs.nom = 'Le nom ne peut pas être vide.';
  const taux = parseFloat(salaireHeure);
  if (!(taux > 0)) erreurs.salaireHeure = 'Indiquez un taux supérieur à 0.';
  return Object.keys(erreurs).length ? erreurs : null;
};

// Vrai si l'employé est le compte actuellement connecté (comparaison par email).
export const estSonCompte = (employe, emailConnecte) =>
  Boolean(emailConnecte) && employe.email?.toLowerCase() === emailConnecte.toLowerCase();

// Convertit une saisie heures + minutes en heures décimales (7 h 20 donne 7,3333).
export const heuresEnDecimal = (heures, minutes) =>
  (parseInt(heures, 10) || 0) + (parseInt(minutes, 10) || 0) / 60;

// Renvoie le message d'erreur d'une durée journalière invalide, ou null si elle est valide.
export const erreurSaisieHeures = (total) =>
  total <= 0 || total > HEURES_MAX_PAR_JOUR
    ? `La durée d'une journée doit être supérieure à 0 et ne pas dépasser ${HEURES_MAX_PAR_JOUR} h.`
    : null;

// Heures déjà saisies un jour donné (plusieurs saisies possibles : deux services, par exemple).
export const heuresDuJour = (heures, date) =>
  heures.filter((heure) => heure.date === date).reduce((total, heure) => total + Number(heure.nbHeure ?? 0), 0);

// Nombre de jours différents ayant au moins une saisie.
export const joursDistincts = (heures) => new Set(heures.map((heure) => heure.date)).size;

// Erreur si ajouter `ajout` heures à celles déjà saisies dépasse la journée maximale, sinon null.
export const erreurTotalJournee = (dejaSaisi, ajout) =>
  dejaSaisi + ajout > HEURES_MAX_PAR_JOUR + 0.0001
    ? `Il y a déjà ${formaterHeures(dejaSaisi)} ce jour-là : la journée dépasserait ${HEURES_MAX_PAR_JOUR} h.`
    : null;

// Dernier jour où l'on peut saisir des heures dans la période : jamais dans le futur.
export const dernierJourSaisissable = (periode, aujourdhui = aujourdhuiIso()) =>
  periode.fin < aujourdhui ? periode.fin : aujourdhui;

// Date proposée pour la prochaine saisie : le lendemain de la dernière saisie de la période,
// ou le début de la période, sans dépasser le dernier jour saisissable.
export const dateParDefaut = (heures, periode, aujourdhui = aujourdhuiIso()) => {
  const derniere = heures.reduce((max, heure) => (heure.date > max ? heure.date : max), '');
  const candidate = derniere ? ajouterJours(derniere, 1) : periode.debut;
  const maximum = dernierJourSaisissable(periode, aujourdhui);
  return candidate > maximum ? maximum : candidate;
};

// Affiche des heures décimales sous la forme "7 h 20" (ou "8 h").
export const formaterHeures = (valeurDecimale) => {
  const totalMinutes = Math.round(Number(valeurDecimale ?? 0) * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`;
};

export const totalHeures = (heures) => heures.reduce((total, heure) => total + Number(heure.nbHeure ?? 0), 0);

// Saisies triées de la plus récente à la plus ancienne.
export const heuresRecentesDabord = (heures) =>
  [...heures].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

// Salaire estimé = heures × taux horaire, arrondi au centime (même calcul que le backend).
// null si le taux n'est pas défini.
export const estimationSalaire = (heures, salaireHeure) =>
  salaireHeure == null ? null : Math.round(heures * Number(salaireHeure) * 100) / 100;

// Taux horaire "12,50 € / h" ; un taux absent ne fait pas planter l'affichage.
export const formaterTaux = (salaireHeure) =>
  salaireHeure == null ? '—' : `${formaterPrix(salaireHeure)} / h`;

// Libellés lisibles des valeurs du backend ("admin" -> "Administrateur", "MANAGER" -> "Manager").
const libelleDans = (liste, valeur) => liste.find((option) => option.value === valeur)?.label ?? valeur;
export const libelleRoleSysteme = (valeur) => libelleDans(ROLES_SYSTEME, valeur);
export const libelleRoleRH = (valeur) => libelleDans(ROLES_RH, valeur);