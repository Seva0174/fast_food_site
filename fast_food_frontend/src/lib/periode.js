export const erreurPeriode = (debut, fin) =>
  debut && fin && fin < debut ? 'La date de fin doit être postérieure à la date de début.' : null;

// --- Dates "AAAA-MM-JJ" (format de l'API), en heure locale ---

export const versIso = (date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

export const depuisIso = (iso) => {
  const [annee, mois, jour] = iso.split('-').map(Number);
  return new Date(annee, mois - 1, jour);
};

export const ajouterJours = (iso, nombre) => {
  const date = depuisIso(iso);
  date.setDate(date.getDate() + nombre);
  return versIso(date);
};

export const aujourdhuiIso = () => versIso(new Date());

// Nombre de jours d'une periode, bornes comprises (le backend inclut la date de fin).
export const nombreJours = ({ debut, fin }) =>
  Math.round((depuisIso(fin) - depuisIso(debut)) / 86_400_000) + 1;

export const libelleNombreJours = (periode) => {
  const nombre = nombreJours(periode);
  return `${nombre} jour${nombre > 1 ? 's' : ''}`;
};

// --- Periodes rapides ---

export const PERIODE_GLOBALE = 'global';
export const PERIODE_PERSONNALISEE = 'personnalisee';

export const PERIODES_RAPIDES = [
  { id: '7j', libelle: '7 derniers jours' },
  { id: '30j', libelle: '30 derniers jours' },
  { id: 'mois', libelle: 'Ce mois-ci' },
  { id: 'moisPrecedent', libelle: 'Mois dernier' },
  { id: PERIODE_GLOBALE, libelle: 'Depuis le début' },
];

// { debut, fin } d'une periode rapide, ou null pour la vue globale.
export const periodeRapide = (id, aujourdhui = aujourdhuiIso()) => {
  const date = depuisIso(aujourdhui);
  const annee = date.getFullYear();
  const mois = date.getMonth();

  switch (id) {
    case '7j':
      return { debut: ajouterJours(aujourdhui, -6), fin: aujourdhui };
    case '30j':
      return { debut: ajouterJours(aujourdhui, -29), fin: aujourdhui };
    case 'mois':
      return { debut: versIso(new Date(annee, mois, 1)), fin: aujourdhui };
    case 'moisPrecedent':
      return { debut: versIso(new Date(annee, mois - 1, 1)), fin: versIso(new Date(annee, mois, 0)) };
    default:
      return null;
  }
};

// Periode de meme duree juste avant, pour la comparaison.
export const periodePrecedente = (periode) => {
  const fin = ajouterJours(periode.debut, -1);
  return { debut: ajouterJours(fin, -(nombreJours(periode) - 1)), fin };
};

// --- Libelles ---

const formateurJour = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const formateurJourAnnee = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const formateurJourComplet = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full' });
const formateurMois = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });

// "2 oct. – 31 oct. 2026", ou "3 oct. 2026" pour un seul jour.
export const libellePeriode = ({ debut, fin }) => {
  if (debut === fin) return formateurJourAnnee.format(depuisIso(debut));
  const formateurDebut = debut.slice(0, 4) === fin.slice(0, 4) ? formateurJour : formateurJourAnnee;
  return `${formateurDebut.format(depuisIso(debut))} – ${formateurJourAnnee.format(depuisIso(fin))}`;
};

// "lundi 3 octobre 2026" (nom accessible d'un jour du calendrier).
export const libelleJourComplet = (iso) => formateurJourComplet.format(depuisIso(iso));

// "octobre 2026"
export const libelleMois = ({ annee, mois }) => formateurMois.format(new Date(annee, mois, 1));

// --- Calendrier ---

// Mois { annee, mois } d'une date, et decalage de n mois.
export const moisDe = (iso) => {
  const date = depuisIso(iso);
  return { annee: date.getFullYear(), mois: date.getMonth() };
};

export const decalerMois = ({ annee, mois }, nombre) => {
  const date = new Date(annee, mois + nombre, 1);
  return { annee: date.getFullYear(), mois: date.getMonth() };
};

export const rangMois = ({ annee, mois }) => annee * 12 + mois;

export const premierJourDuMois = ({ annee, mois }) => versIso(new Date(annee, mois, 1));

// Cases d'un mois, semaines commençant le lundi : null pour les cases vides avant le 1er.
export const casesDuMois = ({ annee, mois }) => {
  const decalage = (new Date(annee, mois, 1).getDay() + 6) % 7;
  const total = new Date(annee, mois + 1, 0).getDate();
  return [
    ...Array(decalage).fill(null),
    ...Array.from({ length: total }, (_, index) => versIso(new Date(annee, mois, index + 1))),
  ];
};
