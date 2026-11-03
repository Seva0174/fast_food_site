import { useState } from 'react';
import { ListeOnglets, Onglets, PanneauOnglet } from '@/components/ui/onglets';
import { VueStatistiques } from '../components/admin/statistiques/VueStatistiques';
import { VueCarteAdmin } from '@/components/admin/carte/VueCarteAdmin';
import { VueStockAdmin } from '../components/admin/stock/VueStockAdmin';
import { VuePersonnel } from '../components/admin/personnel/VuePersonnel';

// Chaque onglet associe un identifiant, un libellé et la vue à afficher.
const ONGLETS = [
  // garder : la vue reste montée (masquée) quand on change d'onglet, pour retrouver ses filtres. Les statistiques
  // se rechargent à chaque retour : des graphiques masqués seraient mesurés à 0 pixel.
  { id: 'statistiques', libelle: 'Statistiques', Vue: VueStatistiques, garder: false },
  { id: 'carte', libelle: 'Carte & Produits', Vue: VueCarteAdmin, garder: true },
  { id: 'stock', libelle: 'Stock & Fournisseurs', Vue: VueStockAdmin, garder: true },
  { id: 'personnel', libelle: 'Personnel', Vue: VuePersonnel, garder: true },
];

export function AdminPage() {
  const [ongletActif, setOngletActif] = useState(ONGLETS[0].id);
  // Une vue n'est chargée qu'à sa première ouverture, puis reste montée (masquée) :
  // revenir sur un onglet retrouve ses filtres et sa position
  const [ongletsOuverts, setOngletsOuverts] = useState(() => new Set([ONGLETS[0].id]));

  const changerOnglet = (id) => {
    setOngletActif(id);
    setOngletsOuverts((precedents) => (precedents.has(id) ? precedents : new Set(precedents).add(id)));
  };

  // Le padding et la largeur maximale viennent de MainLayout.
  return (
    <Onglets actif={ongletActif} onChange={changerOnglet}>
      <div className="space-y-6">
        <ListeOnglets onglets={ONGLETS} label="Administration" />
        {ONGLETS.filter(({ id }) => ongletsOuverts.has(id)).map(({ id, Vue, garder }) => (
          <PanneauOnglet key={id} id={id} garderMonte={garder}>
            <Vue />
          </PanneauOnglet>
        ))}
      </div>
    </Onglets>
  );
}

export default AdminPage;
