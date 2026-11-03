import { useId, useRef, useState } from 'react';
import { Pencil, X } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { useEditionExclusive } from '@/hooks/useEditionsEnCours';
import { useEnvoi } from '@/hooks/useEnvoi';
import { erreurSurcout } from '@/lib/formule';
import { formaterPrix, formaterSupplement } from '@/lib/prix';
import { classeBadge, classeChamp } from './classes';
import { ErreurChamp } from './ErreurChamp';

// Un produit proposé dans un emplacement : prix seul, surcoût dans le menu (modifiable) et retrait.
// Édition du surcoût : Entrée enregistre ; le focus revient ensuite au crayon.
export const LienProduitFormule = ({ lien, nomEmplacement, onModifierSurcout, onRetirer }) => {
  const id = useId();
  const { ouverte: enEdition, ailleurs, ouvrir, fermer, attente } = useEditionExclusive();
  const [surcout, setSurcout] = useState('0');
  const [erreur, setErreur] = useState(null);
  const { enCours, lancer } = useEnvoi();
  const crayon = useRef(null);

  const demarrerEdition = () => {
    setSurcout(String(lien.surcout ?? 0));
    setErreur(null);
    ouvrir();
  };

  const terminerEdition = () => {
    fermer();
    // Le crayon réapparaît au rendu suivant
    requestAnimationFrame(() => crayon.current?.focus());
  };

  const enregistrer = async (e) => {
    e.preventDefault();
    const messageErreur = erreurSurcout(parseFloat(surcout || 0));
    setErreur(messageErreur);
    if (messageErreur) return;
    if (await lancer(() => onModifierSurcout(lien.id, surcout))) terminerEdition();
  };

  const aUnSurcout = Number(lien.surcout) > 0;

  return (
    <li className="space-y-1 rounded-lg border border-border py-1.5 pl-3 pr-1 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 pt-1">
          <span className="font-medium">{lien.nomProduit}</span>
          {!lien.estDispo && <span className={`${classeBadge} ml-2`}>Hors vente</span>}
          <p className="tabular-nums text-muted-foreground">Prix seul : {formaterPrix(lien.prixProduit)}</p>
        </div>
        <Bouton
          variante="fantomeDanger"
          taille="nu"
          className="size-9 shrink-0"
          onClick={() => !ailleurs && !enEdition && onRetirer()}
          title="Retirer de l'emplacement"
          aria-label={`Retirer ${lien.nomProduit} de « ${nomEmplacement} »`}
          {...attente(ailleurs || enEdition)}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Bouton>
      </div>

      {enEdition ? (
        <form onSubmit={enregistrer} noValidate className="pb-1 pr-2">
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor={`${id}-surcout`} className="text-muted-foreground">
              Surcoût (€)
            </label>
            <input
              id={`${id}-surcout`}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              autoFocus
              value={surcout}
              onChange={(e) => {
                setSurcout(e.target.value);
                setErreur(null);
              }}
              aria-invalid={Boolean(erreur)}
              aria-describedby={erreur ? `${id}-erreur` : undefined}
              className={`${classeChamp} w-24 bg-card tabular-nums`}
            />
            <Bouton type="submit" taille="sm" className="min-h-10" disabled={enCours}>
              {enCours ? 'Enregistrement…' : 'Enregistrer'}
            </Bouton>
            <Bouton variante="secondaire" taille="sm" className="min-h-10" onClick={terminerEdition}>
              Annuler
            </Bouton>
          </div>
          <ErreurChamp id={`${id}-erreur`} message={erreur} />
        </form>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">
            Dans le menu :{' '}
            <strong className="font-semibold tabular-nums text-foreground">
              {aUnSurcout ? formaterSupplement(lien.surcout) : 'sans surcoût'}
            </strong>
          </span>
          <Bouton
            ref={crayon}
            variante="fantome"
            taille="nu"
            className="size-9 shrink-0"
            onClick={() => !ailleurs && demarrerEdition()}
            aria-label={`Modifier le surcoût de ${lien.nomProduit} dans « ${nomEmplacement} »`}
            title="Modifier le surcoût"
            {...attente(ailleurs)}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Bouton>
        </div>
      )}
    </li>
  );
};
