import { useId } from 'react';
import { AlertTriangle, EyeOff, ImageOff, LayoutList, Lock, SlidersHorizontal, Trash2 } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { Interrupteur } from '@/components/ui/interrupteur';
import { useEnvoi } from '@/hooks/useEnvoi';
import {
  STATUT_PRODUIT,
  imageCassee,
  libelleStatut,
  resumeConfiguration,
  statutProduit,
  verifierMiseEnVente,
} from '@/lib/carte';
import { formaterPrix } from '@/lib/prix';
import { classeBadge, classeBadgeAlerte } from './classes';
import { ImageProduit } from './ImageProduit';

// Ce que voit le client quand le produit est en vente mais ne peut pas être acheté
const BADGE_STATUT = {
  [STATUT_PRODUIT.BLOQUE]: { classe: classeBadgeAlerte, icone: AlertTriangle },
  [STATUT_PRODUIT.MASQUE]: { classe: classeBadge, icone: EyeOff },
};

// Une ligne du tableau de la carte : informations, configuration, mise en vente et actions.
// L'interrupteur dit seulement ce que l'admin a décidé (en vente ou hors vente) ; un badge à part dit ce que
// voit le client quand le produit, bien qu'en vente, ne peut pas être acheté (non commandable, masqué).
// Un produit hors vente qui ne pourrait pas être acheté ne peut pas être mis en vente : la raison est affichée
// et l'interrupteur attend. Le nom du produit ouvre sa fiche.
export const LigneProduit = ({
  produit,
  echecsImages,
  onImageCassee,
  onChangerDisponibilite,
  onGererComposition,
  onGererOptions,
  onModifier,
  onSupprimer,
}) => {
  const idRaison = useId();
  const { enCours, lancer } = useEnvoi();
  const { statut, raison } = statutProduit(produit);
  const badge = BADGE_STATUT[statut];
  const IconeBadge = badge?.icone;
  const venteImpossible = !produit.estDispo ? verifierMiseEnVente(produit) : { ok: true };
  const attente = !venteImpossible.ok;
  const cassee = imageCassee(produit, echecsImages);

  return (
    <tr className="align-middle transition-colors hover:bg-muted/40">
      <th scope="row" className="p-3 text-left font-medium">
        <div className="flex items-center gap-3">
          <ImageProduit url={produit.imageUrl} alt="" onErreur={() => onImageCassee(produit)} />
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => onModifier(produit)}
              title="Ouvrir la fiche du produit"
              className="rounded-sm text-left font-medium underline-offset-4 hover:underline"
            >
              <span className="sr-only">Modifier </span>
              {produit.nom}
            </button>
            {produit.description && (
              <p className="mt-0.5 line-clamp-1 text-sm font-normal text-muted-foreground" title={produit.description}>
                {produit.description}
              </p>
            )}
          </div>
        </div>
      </th>

      <td className="p-3">
        {/* Chaque partie reste sur sa ligne : le texte se coupe au séparateur, pas au milieu */}
        <span className="text-muted-foreground">
          {resumeConfiguration(produit).map((partie, i) => (
            <span key={partie} className="whitespace-nowrap">
              {i > 0 && ' · '}
              {partie}
            </span>
          ))}
        </span>
        {badge && (
          <div id={idRaison} className="mt-1.5 space-y-1">
            <span className={badge.classe}>
              <IconeBadge className="h-3 w-3" aria-hidden="true" />
              {libelleStatut(statut)}
            </span>
            <p className="text-xs text-muted-foreground">{raison}</p>
          </div>
        )}
        {attente && (
          <p id={idRaison} className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
            <Lock className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
            Ne peut pas être mis en vente : {venteImpossible.raison}
          </p>
        )}
        {cassee && (
          <div className="mt-1.5 space-y-1">
            <span className={classeBadge}>
              <ImageOff className="h-3 w-3" aria-hidden="true" />
              Image introuvable
            </span>
            <p className="text-xs text-muted-foreground">Vérifie l'adresse de l'image.</p>
          </div>
        )}
      </td>

      <td className="whitespace-nowrap p-3 text-right font-semibold tabular-nums">{formaterPrix(produit.prix)}</td>

      <td className="p-3">
        <Interrupteur
          actif={produit.estDispo}
          disabled={enCours}
          onChange={() => !attente && lancer(() => onChangerDisponibilite(produit))}
          aria-disabled={attente || undefined}
          aria-describedby={badge || attente ? idRaison : undefined}
          className="pr-2"
        >
          <span className={`whitespace-nowrap ${produit.estDispo ? 'text-foreground' : 'text-muted-foreground'}`}>
            <span className="sr-only">{produit.nom} : </span>
            {produit.estDispo ? 'En vente' : 'Hors vente'}
          </span>
        </Interrupteur>
      </td>

      <td className="p-3">
        <div className="flex items-center justify-end gap-2">
          {produit.estFormule ? (
            <Bouton
              variante="secondaire"
              taille="sm"
              className="min-h-9 whitespace-nowrap"
              onClick={() => onGererComposition(produit)}
              aria-label={`Composition de ${produit.nom}`}
            >
              <LayoutList className="h-4 w-4" aria-hidden="true" />
              Composition
            </Bouton>
          ) : (
            <Bouton
              variante="secondaire"
              taille="sm"
              className="min-h-9 whitespace-nowrap"
              onClick={() => onGererOptions(produit)}
              aria-label={`Options de ${produit.nom}`}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Options
            </Bouton>
          )}
          <Bouton
            variante="fantomeDanger"
            taille="nu"
            className="size-9 shrink-0"
            onClick={() => onSupprimer(produit)}
            aria-label={`Supprimer ${produit.nom}`}
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Bouton>
        </div>
      </td>
    </tr>
  );
};
