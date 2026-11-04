import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { ModalConfirmation } from '@/components/modales/ModalConfirmation';
import { FormulaireAjoutStock } from '@/components/admin/stock/FormulaireAjoutStock';
import { TableauStocks } from '@/components/admin/stock/TableauStocks';
import { useConfirmation } from '@/hooks/useConfirmation';
import { DESCRIPTION_SEUILS, filtrerStocks, trierParUrgence } from '@/lib/stock';

const FILTRES_VIDES = { recherche: '', seulementAlertes: false };

// Sous-onglet « Stocks actuels ». `stocks` est le retour de useStocks (partagé avec l'en-tête), le
// formulaire d'ajout s'ouvre depuis l'en-tête (formAjoutOuvert) et refTitre reçoit le focus après une suppression.
export function VueStockActuel({ stocks: donnees, formAjoutOuvert, onFermerForm, refTitre }) {
  const { stocks, chargement, erreur, enCours, charger, creer, modifier, supprimer } = donnees;
  const { confirmer, modaleProps } = useConfirmation();
  const [filtres, setFiltres] = useState(FILTRES_VIDES);

  const affiches = useMemo(() => trierParUrgence(filtrerStocks(stocks, filtres)), [stocks, filtres]);
  const pret = !chargement && !erreur && stocks.length > 0;

  const demanderSuppression = async (stock) => {
    const confirme = await confirmer({
      titre: 'Supprimer la matière première ?',
      message: `« ${stock.nom} » sera retirée du stock. Cette action est irréversible.`,
      libelleConfirmer: 'Supprimer',
      libelleRefuser: 'Garder',
      destructif: true,
    });
    if (!confirme) return;
    if (await supprimer(stock)) refTitre.current?.focus();
  };

  return (
    <div className="space-y-4">
      {formAjoutOuvert && <FormulaireAjoutStock enCours={enCours} onAjouter={creer} onFermer={onFermerForm} />}

      {pret && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="relative w-full sm:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={filtres.recherche}
              onChange={(e) => setFiltres((f) => ({ ...f, recherche: e.target.value }))}
              placeholder="Rechercher un ingrédient"
              aria-label="Rechercher un ingrédient"
              className="min-h-10 w-full rounded-lg border border-input bg-transparent pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <Bouton
            variante={filtres.seulementAlertes ? 'sombre' : 'secondaire'}
            taille="sm"
            className="min-h-10"
            aria-pressed={filtres.seulementAlertes}
            onClick={() => setFiltres((f) => ({ ...f, seulementAlertes: !f.seulementAlertes }))}
          >
            À réapprovisionner seulement
          </Bouton>
          <p className="text-sm text-muted-foreground sm:ml-auto">Seuil d'alerte : {DESCRIPTION_SEUILS}</p>
        </div>
      )}

      <TableauStocks
        stocks={affiches}
        chargement={chargement}
        erreur={erreur}
        stockVide={stocks.length === 0}
        enCours={enCours}
        onRecharger={charger}
        onEffacerFiltres={() => setFiltres(FILTRES_VIDES)}
        onModifier={modifier}
        onSupprimer={demanderSuppression}
      />

      <ModalConfirmation {...modaleProps} />
    </div>
  );
}
