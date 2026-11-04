import { useState } from 'react';
import { ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { ComposantsFormule } from '../produits/ComposantsFormule';
import { QuantiteStepper } from '../panier/QuantiteStepper';
import { Bouton } from '../ui/bouton';
import { formaterPrix } from '../../lib/prix';

const LigneRecapitulatif = ({ item, onDiminuer, onAugmenter, onSupprimer }) => (
  <li className="py-3">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="font-semibold">{item.nom}</h3>

        {item.options.length > 0 && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {item.options.map((option) => option.nom).join(', ')}
          </p>
        )}

        <ComposantsFormule composants={item.composants} />
      </div>

      <p className="shrink-0 font-bold tabular-nums">{formaterPrix(item.quantite * item.prix)}</p>
    </div>

    <div className="mt-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <QuantiteStepper quantite={item.quantite} onDiminuer={onDiminuer} onAugmenter={onAugmenter} />
        <span className="text-xs tabular-nums text-muted-foreground">
          {formaterPrix(item.prix)} l’unité
        </span>
      </div>

      <Bouton
        variante="fantome"
        taille="icone"
        onClick={onSupprimer}
        aria-label={`Retirer ${item.nom}`}
        title="Retirer"
      >
        <Trash2 className="h-4 w-4" />
      </Bouton>
    </div>
  </li>
);

// Recapitulatif du panier. Sur mobile, il est replie en une ligne (nombre d'articles, total)
// pour laisser le mode de retrait a l'ecran ; le detail se deplie a la demande.
export const RecapitulatifCommande = ({
  panier,
  totalPrix,
  onDiminuer,
  onAugmenter,
  onSupprimer,
  onModifier,
}) => {
  const [detailOuvert, setDetailOuvert] = useState(false);
  const nombreArticles = panier.reduce((total, item) => total + item.quantite, 0);

  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="titre-marque text-3xl">Ton panier</h2>
        <button
          type="button"
          onClick={onModifier}
          className="-mr-2 inline-flex min-h-11 items-center gap-1 px-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Modifier
        </button>
      </div>

      {/* Resume mobile : un appui deplie le detail */}
      <button
        type="button"
        aria-expanded={detailOuvert}
        aria-controls="detail-panier"
        onClick={() => setDetailOuvert((ouvert) => !ouvert)}
        className="mt-2 flex min-h-11 w-full items-center justify-between gap-3 text-left md:hidden"
      >
        <span className="text-sm text-muted-foreground">
          {nombreArticles} article{nombreArticles > 1 ? 's' : ''} ·{' '}
          <span className="font-bold tabular-nums text-foreground">{formaterPrix(totalPrix)}</span>
        </span>
        <span className="flex items-center gap-1 text-sm font-semibold">
          {detailOuvert ? 'Masquer' : 'Détail'}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${detailOuvert ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </span>
      </button>

      <div id="detail-panier" className={`${detailOuvert ? 'block' : 'hidden'} md:block`}>
        <ul className="mt-2 divide-y divide-border pr-1 scrollbar-thin md:max-h-[28rem] md:overflow-y-auto">
          {panier.map((item) => (
            <LigneRecapitulatif
              key={item.id}
              item={item}
              onDiminuer={() => onDiminuer(item.id)}
              onAugmenter={() => onAugmenter(item.id)}
              onSupprimer={() => onSupprimer(item.id)}
            />
          ))}
        </ul>

        <div className="mt-2 flex items-baseline justify-between border-t border-border pt-4">
          <span className="font-semibold">Total</span>
          <span className="text-2xl font-extrabold tabular-nums">{formaterPrix(totalPrix)}</span>
        </div>
      </div>
    </section>
  );
};
