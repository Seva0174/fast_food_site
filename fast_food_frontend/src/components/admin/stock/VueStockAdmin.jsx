import { useState } from 'react';
import { VueFournisseurs } from '@/components/admin/stock/VueFournisseurs';
import { ListeOnglets, Onglets, PanneauOnglet } from '@/components/ui/onglets';
import { VueStockActuel } from './VueStockActuel';

const SOUS_ONGLETS = [
  { id: 'fournisseurs', libelle: 'Fournisseurs & Commandes' },
  { id: 'stocks_actuels', libelle: 'Stocks actuels' },
];

export function VueStockAdmin() {
  const [sousOnglet, setSousOnglet] = useState(SOUS_ONGLETS[0].id);

  return (
    <Onglets actif={sousOnglet} onChange={setSousOnglet}>
      <div className="space-y-6">
        {/* Même en-tête que la carte et le personnel : titre d'enseigne, puis la navigation à droite */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="titre-marque text-3xl">Stock</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Matières premières, fournisseurs et commandes d'approvisionnement.
            </p>
          </div>
          <ListeOnglets variante="segments" onglets={SOUS_ONGLETS} label="Stock" />
        </div>

        {/* Masqué plutôt que démonté : le bon de commande en cours survit au passage sur les stocks */}
        <PanneauOnglet id="fournisseurs" garderMonte>
          <VueFournisseurs />
        </PanneauOnglet>

        {/* Démonté à chaque changement d'onglet : les stocks sont rechargés (par exemple après une réception) */}
        <PanneauOnglet id="stocks_actuels">
          <VueStockActuel />
        </PanneauOnglet>
      </div>
    </Onglets>
  );
}
