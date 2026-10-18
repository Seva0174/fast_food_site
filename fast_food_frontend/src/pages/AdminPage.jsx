import { useState } from 'react';
import { Onglets } from '@/components/ui/onglets';
import { VueStatistiques } from '../components/admin/statistiques/VueStatistiques';
import { VueCarteAdmin } from '@/components/admin/carte/VueCarteAdmin';
import { VueStockAdmin } from '../components/admin/stock/VueStockAdmin';
import { VuePersonnel } from '../components/admin/personnel/VuePersonnel';

// Chaque onglet associe un identifiant, un libellé et la vue à afficher.
const ONGLETS = [
  { id: 'statistiques', libelle: 'Statistiques', Vue: VueStatistiques },
  { id: 'carte', libelle: 'Carte & Produits', Vue: VueCarteAdmin },
  { id: 'stock', libelle: 'Stock & Fournisseurs', Vue: VueStockAdmin },
  { id: 'personnel', libelle: 'Personnel', Vue: VuePersonnel },
];

export function AdminPage() {
  const [ongletActif, setOngletActif] = useState(ONGLETS[0].id);
  const { Vue } = ONGLETS.find((onglet) => onglet.id === ongletActif);

  // Le padding et la largeur maximale viennent de MainLayout.
  return (
    <div className="space-y-6">
      <Onglets onglets={ONGLETS} actif={ongletActif} onChange={setOngletActif} />
      <Vue />
    </div>
  );
}

export default AdminPage;