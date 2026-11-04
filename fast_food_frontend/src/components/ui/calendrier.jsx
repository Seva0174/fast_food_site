import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import {
  ajouterJours,
  aujourdhuiIso,
  casesDuMois,
  decalerMois,
  libelleJourComplet,
  libelleMois,
  libelleNombreJours,
  libellePeriode,
  moisDe,
  premierJourDuMois,
  rangMois,
} from '@/lib/periode';

const JOURS_SEMAINE = [
  ['L', 'lundi'],
  ['M', 'mardi'],
  ['M', 'mercredi'],
  ['J', 'jeudi'],
  ['V', 'vendredi'],
  ['S', 'samedi'],
  ['D', 'dimanche'],
];

const DEPLACEMENTS_CLAVIER = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };

// Style d'un jour selon sa place dans la sélection.
const classeJour = ({ borne, dansPlage, desactive }) => {
  if (borne) return 'rounded-lg bg-primary font-semibold text-primary-foreground';
  if (dansPlage) return 'bg-primary/15 text-foreground';
  if (desactive) return 'cursor-not-allowed text-muted-foreground/40';
  return 'rounded-lg hover:bg-accent';
};

const GrilleMois = ({ mois, aujourdhui, min, max, debut, finApercu, focus, onChoisir, onSurvol, onClavier }) => (
  <div>
    <p className="flex h-10 items-center justify-center text-sm font-semibold capitalize">
      {libelleMois(mois)}
    </p>
    <div className="grid grid-cols-7">
      {JOURS_SEMAINE.map(([court, long]) => (
        <abbr
          key={long}
          title={long}
          className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground no-underline"
        >
          {court}
        </abbr>
      ))}
      {casesDuMois(mois).map((iso, index) => {
        if (!iso) return <span key={`vide-${index}`} aria-hidden="true" />;

        const desactive = iso > max || (min !== undefined && iso < min);
        const borne = iso === debut || iso === finApercu;
        const dansPlage = Boolean(debut && finApercu && iso > debut && iso < finApercu);
        const estAujourdhui = iso === aujourdhui;

        return (
          <button
            key={iso}
            type="button"
            data-date={iso}
            tabIndex={iso === focus ? 0 : -1}
            disabled={desactive}
            aria-pressed={borne}
            aria-label={`${libelleJourComplet(iso)}${estAujourdhui ? ', aujourd’hui' : ''}`}
            onClick={() => onChoisir(iso)}
            onMouseEnter={() => onSurvol(iso)}
            onKeyDown={(e) => onClavier(e, iso)}
            className={`relative flex size-10 items-center justify-center text-sm tabular-nums transition-colors focus-visible:z-10 ${classeJour({ borne, dansPlage, desactive })}`}
          >
            {Number(iso.slice(8))}
            {estAujourdhui && !borne && (
              <span aria-hidden="true" className="absolute bottom-1 size-1 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  </div>
);

// Calendrier partagé, en deux modes :
// - 'plage' (par défaut) : choix d'une période en deux clics (début puis fin), validée par « Appliquer ».
//   valeur : { debut, fin } déjà appliquée, ou null ; onAppliquer reçoit { debut, fin }.
// - 'jour' : choix d'un seul jour, appliqué dès le clic. valeur : "AAAA-MM-JJ" ; onAppliquer reçoit le jour.
// min / max : jours sélectionnables (par défaut : jusqu'à aujourd'hui, jamais dans le futur).
export const Calendrier = ({
  mode = 'plage',
  valeur,
  min,
  max = aujourdhuiIso(),
  onAppliquer,
  onAnnuler,
}) => {
  const aujourdhui = aujourdhuiIso();
  const estJour = mode === 'jour';
  const deuxMois = useIsDesktop() && !estJour;
  const [debut, setDebut] = useState(estJour ? (valeur ?? null) : (valeur?.debut ?? null));
  const [fin, setFin] = useState(estJour ? null : (valeur?.fin ?? null));
  const [survol, setSurvol] = useState(null);

  // Jour de départ : celui qui est déjà choisi, ramené dans les bornes
  const depart = (estJour ? valeur : valeur?.fin) ?? max;
  const departBorne = depart > max ? max : min !== undefined && depart < min ? min : depart;
  // Mois de droite ; sur PC, en mode plage, le mois précédent est affiché à sa gauche
  const [moisDroite, setMoisDroite] = useState(moisDe(departBorne));
  const [focus, setFocus] = useState(departBorne);
  const conteneur = useRef(null);
  const focusAuClavier = useRef(false);

  const moisAffiches = deuxMois ? [decalerMois(moisDroite, -1), moisDroite] : [moisDroite];
  const peutAvancer = rangMois(moisDroite) < rangMois(moisDe(max));
  const peutReculer = min === undefined || rangMois(moisAffiches[0]) > rangMois(moisDe(min));

  // Après une flèche du clavier, le focus suit le jour actif (même s'il change de mois)
  useEffect(() => {
    if (!focusAuClavier.current) return;
    focusAuClavier.current = false;
    conteneur.current?.querySelector(`[data-date="${focus}"]`)?.focus();
  }, [focus, moisDroite]);

  const choisir = (iso) => {
    setFocus(iso);
    if (estJour) {
      onAppliquer(iso);
      return;
    }
    if (!debut || fin || iso < debut) {
      setDebut(iso);
      setFin(null);
    } else {
      setFin(iso);
    }
  };

  const changerMois = (nombre) => {
    const nouveau = decalerMois(moisDroite, nombre);
    setMoisDroite(nouveau);
    // Le jour focalisable reste dans les bornes
    const premier = premierJourDuMois(nouveau);
    setFocus(premier > max ? max : min !== undefined && premier < min ? min : premier);
  };

  const surClavier = (e, iso) => {
    const deplacement = DEPLACEMENTS_CLAVIER[e.key];
    if (deplacement === undefined) return;
    e.preventDefault();

    const cible = ajouterJours(iso, deplacement);
    if (cible > max || (min !== undefined && cible < min)) return;

    const rangCible = rangMois(moisDe(cible));
    if (rangCible > rangMois(moisDroite)) setMoisDroite(moisDe(cible));
    if (rangCible < rangMois(moisAffiches[0])) setMoisDroite(decalerMois(moisDe(cible), deuxMois ? 1 : 0));

    focusAuClavier.current = true;
    setFocus(cible);
  };

  // Pendant le choix de la fin, la plage suit la souris
  const finApercu = fin ?? (!estJour && debut && survol && survol >= debut ? survol : null);

  let consigne = 'Choisis la date de début.';
  if (debut && fin) consigne = `${libellePeriode({ debut, fin })} · ${libelleNombreJours({ debut, fin })}`;
  else if (debut) consigne = 'Choisis la date de fin.';

  return (
    <div ref={conteneur}>
      <div className="relative">
        <Bouton
          variante="fantome"
          taille="icone"
          className="absolute left-0 top-0 lg:size-10"
          onClick={() => changerMois(-1)}
          disabled={!peutReculer}
          aria-label="Mois précédent"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Bouton>
        <Bouton
          variante="fantome"
          taille="icone"
          className="absolute right-0 top-0 lg:size-10"
          onClick={() => changerMois(1)}
          disabled={!peutAvancer}
          aria-label="Mois suivant"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Bouton>

        <div className="flex gap-6" onMouseLeave={() => setSurvol(null)}>
          {moisAffiches.map((mois) => (
            <GrilleMois
              key={rangMois(mois)}
              mois={mois}
              aujourdhui={aujourdhui}
              min={min}
              max={max}
              debut={debut}
              finApercu={finApercu}
              focus={focus}
              onChoisir={choisir}
              onSurvol={setSurvol}
              onClavier={surClavier}
            />
          ))}
        </div>
      </div>

      {!estJour && (
        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm tabular-nums" aria-live="polite">
            {consigne}
          </p>
          <div className="flex gap-2">
            <Bouton variante="secondaire" taille="sm" onClick={onAnnuler}>
              Annuler
            </Bouton>
            <Bouton taille="sm" disabled={!debut || !fin} onClick={() => onAppliquer({ debut, fin })}>
              Appliquer
            </Bouton>
          </div>
        </div>
      )}
    </div>
  );
};
