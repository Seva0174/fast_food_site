import { Plus } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';

// Articles du catalogue d'un fournisseur, avec un bouton pour les ajouter au bon de commande.
export const GrilleCatalogue = ({ catalogue, onAjouter }) => {
  if (catalogue.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-8 text-center text-sm text-gray-500">
        Aucun article au catalogue. Importez un fichier CSV (format :{' '}
        <code className="rounded bg-gray-200 px-1 py-0.5">nom_matiere;prix_unitaire</code>).
      </div>
    );
  }

  return (
    <div className="grid max-h-80 grid-cols-1 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
      {catalogue.map((article) => (
        <div
          key={article.id}
          className="flex items-center justify-between rounded-lg border bg-gray-50 p-3 transition hover:border-gray-300"
        >
          <div>
            <p className="text-sm font-semibold text-gray-800">{article.matierePremiereNom}</p>
            <p className="text-xs text-gray-500">{Number(article.prixUnitaire).toFixed(2)} € / unité</p>
          </div>
          <Bouton variante="danger" taille="xs" onClick={() => onAjouter(article)}>
            <Plus className="h-3.5 w-3.5" /> Ajouter
          </Bouton>
        </div>
      ))}
    </div>
  );
};