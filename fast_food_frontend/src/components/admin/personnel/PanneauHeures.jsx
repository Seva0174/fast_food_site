import { useId, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { ChampDate } from '@/components/ui/champ-date';
import { ModalConfirmation } from '@/components/modales/ModalConfirmation';
import { useConfirmation } from '@/hooks/useConfirmation';
import {
  dateParDefaut,
  dernierJourSaisissable,
  erreurTotalJournee,
  formaterHeures,
  heuresDuJour,
  heuresEnDecimal,
  heuresRecentesDabord,
  joursDistincts,
  totalHeures,
} from '@/lib/personnel';
import { ajouterJours, dansPeriode, libelleJourCourt } from '@/lib/periode';

const classeChamp =
  'w-full min-h-10 rounded-lg border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive';
const classeLabel = 'mb-1 block text-sm font-medium text-muted-foreground';

// Saisie et liste des heures d'un employé sur la période affichée.
// ajouter renvoie { saisie } ou { erreur } ; l'erreur s'affiche sous le formulaire.
// La date proposée est le lendemain de la dernière saisie, dans la période (jamais dans le futur).
export const PanneauHeures = ({ heures, chargement, periode, afficher, ajouter, supprimer }) => {
  const id = useId();
  const { confirmer, modaleProps } = useConfirmation();
  const liste = useRef(null);

  // Date choisie par l'utilisateur ; hors de la période affichée, la date proposée reprend la main
  const [dateChoisie, setDateChoisie] = useState('');
  const [saisieHeures, setSaisieHeures] = useState('8');
  const [saisieMinutes, setSaisieMinutes] = useState('0');
  const [erreur, setErreur] = useState('');
  // Avertissement de doublon { cle, texte } : il faut valider une seconde fois pour ajouter
  const [avertissement, setAvertissement] = useState(null);
  // Dernière saisie ajoutée : mise en évidence dans la liste
  const [idNouvelle, setIdNouvelle] = useState(null);

  const dernierJour = dernierJourSaisissable(periode);
  const date =
    dateChoisie && dansPeriode(dateChoisie, { debut: periode.debut, fin: dernierJour })
      ? dateChoisie
      : dateParDefaut(heures, periode);

  const cle = `${date}|${saisieHeures}|${saisieMinutes}`;
  const avertissementActif = avertissement?.cle === cle ? avertissement : null;

  const soumettreSaisie = async (e) => {
    e.preventDefault();
    setErreur('');

    const total = heuresEnDecimal(saisieHeures, saisieMinutes);
    const dejaSaisi = heuresDuJour(heures, date);
    const erreurJournee = dejaSaisi > 0 ? erreurTotalJournee(dejaSaisi, total) : null;
    if (erreurJournee) {
      setErreur(erreurJournee);
      return;
    }
    // Même jour déjà saisi : on prévient, et un second clic confirme
    if (dejaSaisi > 0 && !avertissementActif) {
      setAvertissement({
        cle,
        texte: `Il y a déjà ${formaterHeures(dejaSaisi)} le ${libelleJourCourt(date)}. Ajouter ces heures en plus ?`,
      });
      return;
    }

    const resultat = await ajouter(date, saisieHeures, saisieMinutes);
    if (resultat.erreur) {
      setErreur(resultat.erreur);
      return;
    }
    setAvertissement(null);
    setIdNouvelle(resultat.saisie?.id ?? null);
    afficher('Heures enregistrées');
    // On enchaîne sur le jour suivant ; s'il est trop loin, la date proposée reprend la main
    setDateChoisie(ajouterJours(date, 1));
    setSaisieHeures('8');
    setSaisieMinutes('0');
  };

  const demanderSuppression = async (heure) => {
    const confirme = await confirmer({
      titre: 'Supprimer une saisie',
      message: `La saisie du ${libelleJourCourt(heure.date)} (${formaterHeures(heure.nbHeure)}) sera supprimée.`,
      libelleConfirmer: 'Supprimer',
      libelleRefuser: 'Garder',
      destructif: true,
    });
    // La ligne disparaît : le focus revient sur la liste
    if (confirme && (await supprimer(heure.id))) liste.current?.focus();
  };

  const idErreur = `${id}-erreur`;
  const idAvertissement = `${id}-avertissement`;
  const total = totalHeures(heures);
  const jours = joursDistincts(heures);
  const decrire = erreur ? idErreur : avertissementActif ? idAvertissement : undefined;

  return (
    <section aria-labelledby={`${id}-titre`} className="space-y-4 rounded-xl border border-border bg-card p-5">
      <h3 id={`${id}-titre`} className="titre-marque text-2xl">
        Heures travaillées
      </h3>

      <form onSubmit={soumettreSaisie}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,1fr)_5rem_5rem_auto] sm:items-end">
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor={`${id}-date`} className={classeLabel}>
              Date
            </label>
            <ChampDate
              id={`${id}-date`}
              valeur={date}
              onChange={setDateChoisie}
              min={periode.debut}
              max={dernierJour}
            />
          </div>
          <div>
            <label htmlFor={`${id}-heures`} className={classeLabel}>
              Heures
            </label>
            <input
              id={`${id}-heures`}
              type="number"
              min="0"
              max="24"
              value={saisieHeures}
              onChange={(e) => setSaisieHeures(e.target.value)}
              aria-invalid={Boolean(erreur)}
              aria-describedby={decrire}
              className={`${classeChamp} tabular-nums`}
              required
            />
          </div>
          <div>
            <label htmlFor={`${id}-minutes`} className={classeLabel}>
              Minutes
            </label>
            <input
              id={`${id}-minutes`}
              type="number"
              min="0"
              max="59"
              step="5"
              value={saisieMinutes}
              onChange={(e) => setSaisieMinutes(e.target.value)}
              aria-invalid={Boolean(erreur)}
              aria-describedby={decrire}
              className={`${classeChamp} tabular-nums`}
              required
            />
          </div>
          <Bouton type="submit" className="col-span-2 min-h-10 sm:col-span-1">
            {avertissementActif ? 'Ajouter quand même' : 'Ajouter'}
          </Bouton>
        </div>
        {erreur && (
          <p id={idErreur} role="alert" className="mt-2 text-sm font-medium text-destructive">
            {erreur}
          </p>
        )}
        {avertissementActif && (
          <p id={idAvertissement} role="status" className="mt-2 rounded-lg border border-border bg-muted/50 p-3 text-sm">
            {avertissementActif.texte}
          </p>
        )}
      </form>

      <div
        ref={liste}
        tabIndex={-1}
        aria-label="Saisies de la période"
        className="rounded-lg border border-border outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="flex items-baseline justify-between gap-3 border-b border-border px-3 py-2.5 text-sm">
          <span className="text-muted-foreground">
            Total de la période
            {jours > 0 && ` · ${jours} jour${jours > 1 ? 's' : ''}`}
          </span>
          <span className="font-semibold tabular-nums">{formaterHeures(total)}</span>
        </div>

        {chargement ? (
          <p role="status" className="p-3 text-sm text-muted-foreground">
            Chargement des heures…
          </p>
        ) : heures.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">Aucune heure sur cette période.</p>
        ) : (
          <ul className="max-h-72 divide-y divide-border overflow-y-auto text-sm scrollbar-thin">
            {heuresRecentesDabord(heures).map((heure) => (
              <li
                key={heure.id}
                className={`flex items-center justify-between gap-3 py-1 pl-3 pr-1 ${
                  heure.id === idNouvelle ? 'bg-muted/50 font-medium' : ''
                }`}
              >
                <span className="inline-block first-letter:uppercase">
                  {libelleJourCourt(heure.date)}
                  {heure.id === idNouvelle && (
                    <span className="ml-2 text-xs font-semibold text-muted-foreground">Ajoutée</span>
                  )}
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-medium tabular-nums">{formaterHeures(heure.nbHeure)}</span>
                  <Bouton
                    variante="fantome"
                    taille="nu"
                    className="size-9 hover:text-destructive"
                    onClick={() => demanderSuppression(heure)}
                    aria-label={`Supprimer la saisie du ${libelleJourCourt(heure.date)}`}
                    title="Supprimer la saisie"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Bouton>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ModalConfirmation {...modaleProps} />
    </section>
  );
};
