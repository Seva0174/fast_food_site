import { useState } from 'react';
import { PanneauAdmin } from '@/components/admin/PanneauAdmin';
import { VueFournisseurs } from '@/components/admin/stock/VueFournisseurs';
import { Onglets } from '@/components/ui/onglets';
import { VueStockActuel } from './VueStockActuel';

const SOUS_ONGLETS = [
  { id: 'fournisseurs', libelle: 'Fournisseurs & Commandes' },
  { id: 'stocks_actuels', libelle: 'Stocks actuels' },
];

export function VueStockAdmin() {
  const [sousOnglet, setSousOnglet] = useState(SOUS_ONGLETS[0].id);

  return (
    <PanneauAdmin
      titre="Gestion des Stocks & Approvisionnement"
      sousTitre="Gérez les réapprovisionnements en matières premières"
      actions={<Onglets variante="segments" onglets={SOUS_ONGLETS} actif={sousOnglet} onChange={setSousOnglet} />}
    >
      {/* Masqué plutôt que démonté : le bon de commande en cours survit au passage sur les stocks */}
      <div className={sousOnglet === 'fournisseurs' ? undefined : 'hidden'}>
        <VueFournisseurs />
      </div>

      {/* Démonté à chaque changement d'onglet : les stocks sont rechargés (par exemple après une réception) */}
      {sousOnglet === 'stocks_actuels' && <VueStockActuel />}
    </PanneauAdmin>
  );
}