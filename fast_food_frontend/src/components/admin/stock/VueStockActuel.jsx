import { useState } from 'react';
import { Package, Plus } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { BandeauMessage } from '@/components/ui/bandeau';
import { ModalConfirmation } from '@/components/modales/ModalConfirmation';
import { FormulaireAjoutStock } from '@/components/admin/stock/FormulaireAjoutStock';
import { TableauStocks } from '@/components/admin/stock/TableauStocks';
import { useConfirmation } from '@/hooks/useConfirmation';
import { useStocks } from '@/hooks/useStocks';

export function VueStockActuel() {
  const { stocks, chargement, message, charger, creer, modifier, supprimer } = useStocks();
  const { confirmer, modaleProps } = useConfirmation();
  const [formAjoutOuvert, setFormAjoutOuvert] = useState(false);

  const demanderSuppression = async (stock) => {
    const confirme = await confirmer({
      titre: 'Supprimer la matière première',
      message: `Voulez-vous vraiment supprimer "${stock.nom}" ?`,
      libelleConfirmer: 'Supprimer',
    });
    if (confirme) await supprimer(stock.id);
  };

  return (
    <div className="space-y-6">
      <BandeauMessage message={message} />

      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-bold text-gray-800">
          <Package className="h-5 w-5 text-red-600" />
          Niveaux de stock actuels
        </h3>
        <div className="flex items-center gap-2">
          <Bouton taille="xs" onClick={() => setFormAjoutOuvert(!formAjoutOuvert)}>
            <Plus className="h-4 w-4" /> Ajouter Ingrédient
          </Bouton>
          <Bouton variante="neutre" taille="xs" onClick={charger} disabled={chargement}>
            Actualiser
          </Bouton>
        </div>
      </div>

      {formAjoutOuvert && (
        <FormulaireAjoutStock
          chargement={chargement}
          onAjouter={creer}
          onFermer={() => setFormAjoutOuvert(false)}
        />
      )}

      <TableauStocks
        stocks={stocks}
        chargement={chargement}
        onModifier={modifier}
        onSupprimer={demanderSuppression}
      />

      <ModalConfirmation {...modaleProps} />
    </div>
  );
}