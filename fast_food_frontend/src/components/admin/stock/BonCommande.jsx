import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { totalLigne } from '@/lib/approvisionnement';
import { formaterPrix, formaterPrixUnitaire } from '@/lib/prix';
import { UNITES, formaterQuantite, libelleUnite } from '@/lib/stock';

// Bon de commande en cours : lignes modifiables, total et validation. Collé en haut de l'écran sur PC,
// pour rester visible pendant qu'on parcourt le catalogue.
export const BonCommande = ({
  bon,
  total,
  nomFournisseur,
  enCours,
  onIncrementer,
  onDecrementer,
  onModifierQuantite,
  onValider,
}) => (
  <section
    aria-labelledby="titre-bon-commande"
    className="space-y-4 self-start rounded-xl border border-border bg-card p-4 lg:sticky lg:top-20"
  >
    <div className="border-b border-border pb-3">
      <h4 id="titre-bon-commande" className="font-semibold text-foreground">
        Bon de commande
      </h4>
      {nomFournisseur && <p className="text-sm text-muted-foreground">{nomFournisseur}</p>}
    </div>

    {bon.length === 0 ? (
      <p className="py-4 text-sm text-muted-foreground">
        Le bon est vide. Ajoute des articles depuis le catalogue.
      </p>
    ) : (
      <ul className="space-y-3">
        {bon.map((ligne) => (
          <LigneBon
            key={ligne.idStock}
            ligne={ligne}
            onIncrementer={onIncrementer}
            onDecrementer={onDecrementer}
            onModifierQuantite={onModifierQuantite}
          />
        ))}
      </ul>
    )}

    {bon.length > 0 && (
      <div className="space-y-3 border-t border-border pt-3">
        <div className="flex items-baseline justify-between text-foreground">
          <span className="text-sm font-medium">Total HT</span>
          <span className="text-lg font-bold tabular-nums">{formaterPrix(total)}</span>
        </div>
        <Bouton taille="sm" className="w-full" onClick={onValider} disabled={enCours}>
          Valider la commande
        </Bouton>
      </div>
    )}
  </section>
);

// Une ligne du bon. La saisie manuelle reste locale tant que le champ a le focus ;
// la quantité n'est envoyée au bon qu'à la sortie du champ ou sur Entrée.
const LigneBon = ({ ligne, onIncrementer, onDecrementer, onModifierQuantite }) => {
  // null = aucune saisie en cours, la quantité affichée vient du bon
  const [saisie, setSaisie] = useState(null);

  const validerSaisie = () => {
    if (saisie !== null) {
      onModifierQuantite(ligne.idStock, saisie);
      setSaisie(null);
    }
  };

  const unite = UNITES.find((u) => u.value === ligne.uniteMesure)?.court ?? 'unité';
  const pas = formaterQuantite(ligne.pas ?? 1, ligne.uniteMesure);

  return (
    <li className="space-y-1.5 border-b border-border pb-3 text-sm last:border-b-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 break-words font-medium text-foreground">{ligne.nom}</span>
        <span className="shrink-0 font-semibold tabular-nums text-foreground">{formaterPrix(totalLigne(ligne))}</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border">
            <Bouton
              variante="fantome"
              taille="nu"
              className="size-8"
              onClick={() => onDecrementer(ligne.idStock)}
              aria-label={
                ligne.quantite > (ligne.pas ?? 1) ? `Retirer ${pas} de ${ligne.nom}` : `Retirer ${ligne.nom} du bon`
              }
            >
              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
            </Bouton>

            <input
              type="text"
              inputMode="decimal"
              value={saisie ?? ligne.quantite.toLocaleString('fr-FR', { useGrouping: false, maximumFractionDigits: 3 })}
              onChange={(e) => setSaisie(e.target.value)}
              onBlur={validerSaisie}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
              }}
              aria-label={`Quantité de ${ligne.nom}, en ${unite}`}
              className="w-14 rounded-md bg-transparent text-center text-xs font-bold tabular-nums"
            />

            <Bouton
              variante="fantome"
              taille="nu"
              className="size-8"
              onClick={() => onIncrementer(ligne.idStock)}
              aria-label={`Ajouter ${pas} de ${ligne.nom}`}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            </Bouton>
          </div>
          <span className="text-muted-foreground">{libelleUnite(ligne.quantite, ligne.uniteMesure)}</span>
        </div>
        <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
          {formaterPrixUnitaire(ligne.prixUnitaire)} / {unite}
        </span>
      </div>
    </li>
  );
};
