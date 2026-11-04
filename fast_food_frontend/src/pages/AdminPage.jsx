import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ListeOnglets, Onglets, PanneauOnglet } from '@/components/ui/onglets';
import { useAlertesAdmin } from '@/hooks/useAlertesAdmin';
import { VueStatistiques } from '../components/admin/statistiques/VueStatistiques';
import { VueCarteAdmin } from '@/components/admin/carte/VueCarteAdmin';
import { VueStockAdmin } from '../components/admin/stock/VueStockAdmin';
import { VuePersonnel } from '../components/admin/personnel/VuePersonnel';
import { useTitrePage } from '@/hooks/useTitrePage';

// Chaque onglet associe un identifiant, un libellé et la vue à afficher.
const ONGLETS = [
  // garder : la vue reste montée (masquée) quand on change d'onglet, pour retrouver ses filtres. Les statistiques
  // se rechargent à chaque retour : des graphiques masqués seraient mesurés à 0 pixel.
  { id: 'statistiques', libelle: 'Statistiques', Vue: VueStatistiques, garder: false },
  { id: 'carte', libelle: 'Carte', Vue: VueCarteAdmin, garder: true },
  { id: 'stock', libelle: 'Stock', Vue: VueStockAdmin, garder: true },
  { id: 'personnel', libelle: 'Équipe', Vue: VuePersonnel, garder: true },
];

export function AdminPage() {
  useTitrePage('Administration');
  // L'onglet ouvert est dans l'adresse (?onglet=stock) : recharger la page, revenir en arrière ou partager
  // le lien retrouve le même onglet. Un identifiant inconnu ramène au premier.
  const [parametres, setParametres] = useSearchParams();
  const ongletActif = ONGLETS.some(({ id }) => id === parametres.get('onglet'))
    ? parametres.get('onglet')
    : ONGLETS[0].id;
  // Paramètres de chaque onglet au moment où on l'a quitté (sous-onglet du stock...), rendus à son retour
  const parametresParOnglet = useRef({});

  // Une vue n'est chargée qu'à sa première ouverture, puis reste montée (masquée) :
  // revenir sur un onglet retrouve ses filtres et sa position
  const [ongletsOuverts, setOngletsOuverts] = useState(() => new Set([ongletActif]));
  // Onglet atteint par l'adresse (bouton retour) : il compte comme ouvert
  if (!ongletsOuverts.has(ongletActif)) setOngletsOuverts(new Set(ongletsOuverts).add(ongletActif));
  // Ce qui est à traiter (stocks bas, produits à corriger) se voit dans la barre, sans ouvrir chaque onglet
  const { alertes, signaler } = useAlertesAdmin();
  const onglets = ONGLETS.map((onglet) => ({ ...onglet, alerte: alertes[onglet.id] }));
  // Une fonction stable par onglet : les vues la placent dans les dépendances de leurs effets
  const signalements = useMemo(
    () => Object.fromEntries(ONGLETS.map(({ id }) => [id, (nombre) => signaler(id, nombre)])),
    [signaler]
  );

  const changerOnglet = (id) => {
    parametresParOnglet.current[ongletActif] = parametres.toString();
    setParametres(parametresParOnglet.current[id] ?? { onglet: id });
  };

  // Le padding et la largeur maximale viennent de MainLayout.
  return (
    <Onglets actif={ongletActif} onChange={changerOnglet}>
      <div className="space-y-8">
        <header className="space-y-5">
          <div>
            <h1 className="titre-marque text-4xl sm:text-5xl">Administration</h1>
            <p className="mt-2 text-muted-foreground">Ventes, carte, stocks et équipe du restaurant.</p>
            <p className="mt-3 text-sm text-muted-foreground lg:hidden">
              L'administration est pensée pour un ordinateur : sur un petit écran, faites défiler les tableaux
              horizontalement.
            </p>
          </div>
          <ListeOnglets onglets={onglets} label="Administration" />
        </header>
        {ONGLETS.filter(({ id }) => ongletsOuverts.has(id)).map(({ id, Vue, garder }) => (
          <PanneauOnglet key={id} id={id} garderMonte={garder}>
            <Vue onAlerte={signalements[id]} />
          </PanneauOnglet>
        ))}
      </div>
    </Onglets>
  );
}

export default AdminPage;
