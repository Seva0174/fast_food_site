import { Store, Truck, Eye } from 'lucide-react';

const STATUTS_LIVRAISON = [
  { value: 'en_attente', label: 'En attente' },
  { value: 'en_preparation', label: 'En préparation' },
  { value: 'prete', label: 'Prête' },
  { value: 'livree', label: 'Livrée' },
  { value: 'annulee', label: 'Annulée' },
];

const STATUTS_RETRAIT = [
  { value: 'en_attente', label: 'En attente' },
  { value: 'en_preparation', label: 'En préparation' },
  { value: 'prete', label: 'Prête' },
  { value: 'retiree', label: 'Retirée en restaurant' },
  { value: 'annulee', label: 'Annulée' },
];

export const CommandeCard = ({ commande, onChangerStatut, onVoirDetail, enCours }) => {
  const isClickAndCollect =
    commande.typeRetrait === 'click_and_collect' ||
    commande.type_retrait === 'click_and_collect';

  const statutsProposes = isClickAndCollect ? STATUTS_RETRAIT : STATUTS_LIVRAISON;

  const nbArticles = (commande.items || commande.commandesMenu || []).reduce(
    (acc, i) => acc + (i.quantite || 1),
    0
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col justify-between p-5 space-y-4">
      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="font-extrabold text-lg text-gray-900">
              Commande #{commande.id}
            </span>
            <p className="text-xs text-gray-500">
              Passée à {new Date(commande.dateCreation || commande.date_creation).toLocaleTimeString(
                'fr-FR',
                { hour: '2-digit', minute: '2-digit' }
              )} ({new Date(commande.dateCreation || commande.date_creation).toLocaleDateString('fr-FR')})
            </p>
          </div>

          {isClickAndCollect ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
              <Store className="w-3.5 h-3.5" /> Retrait
            </span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> Livraison
            </span>
          )}
        </div>

        <div className="text-xs text-gray-600 mt-2 space-y-1">
          <p className="font-semibold text-gray-800">
            Client : {commande.nomClient || commande.userEmail || `ID User: ${commande.id_user || ''}`}
          </p>
          <p>{nbArticles} article(s) • Total : <span className="font-bold text-red-600">{Number(commande.total).toFixed(2)} €</span></p>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Changer le statut :
          </label>
          <select
            value={commande.status}
            disabled={enCours}
            onChange={(e) => onChangerStatut(commande.id, e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 text-gray-800 text-xs font-semibold rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:outline-none transition cursor-pointer"
          >
            {statutsProposes.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onVoirDetail}
          className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition"
        >
          <Eye className="w-4 h-4" /> Voir les détails
        </button>
      </div>
    </div>
  );
};