import { useMemo } from 'react';
import { AlertTriangle, Plus, XCircle } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { BandeauMessage } from '@/components/ui/bandeau';
import { catalogueParUrgence } from '@/lib/approvisionnement';
import { formaterPrixUnitaire } from '@/lib/prix';
import { ETAT_STOCK, UNITES, etatStock, formaterQuantite, pasCommande } from '@/lib/stock';

// Niveau de stock d'un article : rouge (avec icône) seulement quand il faut racheter.
const NiveauStock = ({ stock }) => {
  if (!stock) return <span className="text-muted-foreground">Stock inconnu</span>;
  const etat = etatStock(stock);
  const quantite = formaterQuantite(stock.quantite, stock.uniteMesure);
  if (etat === ETAT_STOCK.OK) return <span className="text-muted-foreground">En stock : {quantite}</span>;
  const Icone = etat === ETAT_STOCK.EPUISE ? XCircle : AlertTriangle;
  return (
    <span className="inline-flex items-center gap-1 font-medium text-destructive">
      <Icone className="h-3.5 w-3.5" aria-hidden="true" />
      {etat === ETAT_STOCK.EPUISE ? 'Épuisé' : `Stock bas : ${quantite}`}
    </span>
  );
};

// Articles du catalogue d'un fournisseur, ceux qui manquent en premier, avec un bouton pour les
// ajouter au bon de commande.
export const GrilleCatalogue = ({ catalogue, stocks, bon, chargement, erreur, onRecharger, onAjouter }) => {
  const lignes = useMemo(() => catalogueParUrgence(catalogue, stocks), [catalogue, stocks]);

  if (chargement) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Chargement du catalogue…
      </p>
    );
  }

  if (erreur) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <BandeauMessage message={{ texte: 'Impossible de charger le catalogue.', type: 'erreur' }} className="flex-1" />
        <Bouton variante="secondaire" onClick={onRecharger}>
          Réessayer
        </Bouton>
      </div>
    );
  }

  // Catalogue vide : l'encart d'import, ouvert d'office au-dessus, explique la marche à suivre
  if (catalogue.length === 0) return null;

  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {lignes.map(({ article, stock }) => {
        const dansLeBon = bon.find((ligne) => ligne.idStock === article.idStock)?.quantite ?? 0;
        const unite = UNITES.find((u) => u.value === stock?.uniteMesure)?.court ?? 'unité';
        return (
          <li key={article.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-3">
            <div className="min-w-0 flex-1 basis-48">
              <p className="break-words font-semibold text-foreground">{article.matierePremiereNom}</p>
              <p className="text-sm">
                <NiveauStock stock={stock} />
                {dansLeBon > 0 && (
                  <span className="text-foreground">
                    {' · '}Dans le bon : {formaterQuantite(dansLeBon, stock?.uniteMesure)}
                  </span>
                )}
              </p>
            </div>
            <p className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
              {formaterPrixUnitaire(article.prixUnitaire)} / {unite}
            </p>
            <Bouton
              variante="secondaire"
              taille="sm"
              className="whitespace-nowrap"
              onClick={() => onAjouter(article, stock?.uniteMesure)}
              aria-label={`Ajouter ${formaterQuantite(pasCommande(stock?.uniteMesure), stock?.uniteMesure)} de ${
                article.matierePremiereNom
              } au bon de commande`}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Ajouter
            </Bouton>
          </li>
        );
      })}
    </ul>
  );
};
