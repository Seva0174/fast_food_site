import { useEffect, useRef, useState } from 'react';
import { EnTeteVueAdmin } from '@/components/admin/EnTeteVueAdmin';
import { useSearchParams } from 'react-router-dom';
import { Plus, RotateCw } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { VueFournisseurs } from '@/components/admin/stock/VueFournisseurs';
import { ListeOnglets, Onglets, PanneauOnglet } from '@/components/ui/onglets';
import { MessageFlottant } from '@/components/ui/message-flottant';
import { useRetourFocus } from '@/hooks/useRetourFocus';
import { useStocks } from '@/hooks/useStocks';
import { compterAReapprovisionner } from '@/lib/stock';
import { VueStockActuel } from './VueStockActuel';

const ONGLET_STOCKS = 'stocks_actuels';
const ONGLET_REAPPRO = 'reapprovisionnement';

const SOUS_ONGLETS = [
  { id: ONGLET_STOCKS, libelle: 'Stocks actuels' },
  { id: ONGLET_REAPPRO, libelle: 'Réapprovisionnement' },
];

// onAlerte (facultatif) : reçoit le nombre d'ingrédients à réapprovisionner, pour l'onglet de la page.
export function VueStockAdmin({ onAlerte }) {
  // Sous-onglet dans l'adresse (&vue=reapprovisionnement), à côté de l'onglet de la page
  const [parametres, setParametres] = useSearchParams();
  const sousOnglet = parametres.get('vue') === ONGLET_REAPPRO ? ONGLET_REAPPRO : ONGLET_STOCKS;
  // Les stocks sont partagés : le compteur de l'en-tête et le catalogue fournisseur lisent les mêmes niveaux
  const stocks = useStocks();
  const [formAjoutOuvert, setFormAjoutOuvert] = useState(false);
  const boutonAjout = useRetourFocus(formAjoutOuvert);
  // Après une suppression, la ligne a disparu : le focus revient au titre
  const titre = useRef(null);

  const aReapprovisionner = compterAReapprovisionner(stocks.stocks);
  const nombre = stocks.stocks.length;
  const pret = !stocks.chargement && !stocks.erreur && nombre > 0;

  // Le repère de l'onglet suit les niveaux affichés ici (après un ajout, une réception...)
  useEffect(() => {
    if (!stocks.chargement && !stocks.erreur) onAlerte?.(aReapprovisionner);
  }, [stocks.chargement, stocks.erreur, aReapprovisionner, onAlerte]);

  // Retour sur les stocks : ils sont relus (une réception a pu les créditer entre-temps)
  const changerSousOnglet = (id) => {
    setParametres((precedents) => {
      const suivants = new URLSearchParams(precedents);
      if (id === ONGLET_STOCKS) suivants.delete('vue');
      else suivants.set('vue', id);
      return suivants;
    });
    if (id === ONGLET_STOCKS) stocks.charger();
  };

  return (
    <Onglets actif={sousOnglet} onChange={changerSousOnglet}>
      <div className="space-y-6">
        {/* Même en-tête que la carte et le personnel : titre d'enseigne et compteur, puis la navigation
            et les actions de l'onglet ouvert sur une même ligne */}
        <div className="space-y-4">
          <EnTeteVueAdmin
            titre="Stock"
            refTitre={titre}
            compteur={
              pret &&
              (aReapprovisionner > 0
                ? `${aReapprovisionner} à réapprovisionner`
                : `${nombre} ingrédient${nombre > 1 ? 's' : ''} en stock`)
            }
            description="Niveaux des matières premières, fournisseurs et commandes de réapprovisionnement."
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <ListeOnglets variante="segments" onglets={SOUS_ONGLETS} label="Stock" />
            {sousOnglet === ONGLET_STOCKS && (
              <div className="flex flex-wrap items-center gap-2">
                <Bouton variante="secondaire" taille="sm" onClick={stocks.charger} disabled={stocks.chargement}>
                  <RotateCw className="h-4 w-4" aria-hidden="true" />
                  Actualiser
                </Bouton>
                {/* Formulaire ouvert : son « Enregistrer » devient la seule action orange */}
                {!formAjoutOuvert && (
                  <Bouton ref={boutonAjout} taille="sm" onClick={() => setFormAjoutOuvert(true)}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Ajouter un ingrédient
                  </Bouton>
                )}
              </div>
            )}
          </div>
        </div>

        <PanneauOnglet id={ONGLET_STOCKS}>
          <VueStockActuel
            stocks={stocks}
            formAjoutOuvert={formAjoutOuvert}
            onFermerForm={() => setFormAjoutOuvert(false)}
            refTitre={titre}
          />
        </PanneauOnglet>

        {/* Masqué plutôt que démonté : les bons de commande en cours survivent au passage sur les stocks */}
        <PanneauOnglet id={ONGLET_REAPPRO} garderMonte>
          <VueFournisseurs stocks={stocks.stocks} onStockCredite={stocks.charger} refTitre={titre} />
        </PanneauOnglet>

        <MessageFlottant message={stocks.message} />
      </div>
    </Onglets>
  );
}
