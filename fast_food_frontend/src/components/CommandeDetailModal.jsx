import { X, Clock, MapPin, CheckCircle, Package, AlertCircle, Store, Truck } from 'lucide-react';

export const CommandeDetailModal = ({ commande, onClose }) => {
  if (!commande) return null;

  const isClickAndCollect = commande.typeRetrait === 'click_and_collect' || commande.type_retrait === 'click_and_collect';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'en_attente':
        return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> En attente</span>;
      case 'en_preparation':
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Package className="w-3.5 h-3.5" /> En préparation</span>;
      case 'prete':
        return <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Prête</span>;
      case 'livree':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Livrée</span>;
      case 'retiree':
        return <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Retirée en restaurant</span>;
      case 'annulee':
        return <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Annulée</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl z-10 relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              Commande #{commande.id}
              {isClickAndCollect ? (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                  <Store className="w-3 h-3" /> Click & Collect
                </span>
              ) : (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 flex items-center gap-1">
                  <Truck className="w-3 h-3" /> Livraison
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Passée le {new Date(commande.dateCreation || commande.date_creation).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto py-4 space-y-5 flex-1 pr-1">
          
          {/* Statut & Adresse / Retrait */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600">Statut actuel :</span>
              {getStatusBadge(commande.status)}
            </div>

            {isClickAndCollect ? (
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200 text-sm text-gray-700">
                <Store className="w-4 h-4 text-amber-600 shrink-0" />
                <span>À retirer au comptoir du restaurant</span>
              </div>
            ) : (
              <div className="flex items-start gap-2 pt-2 border-t border-gray-200 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">{commande.cp_rue || commande.cpRue}</p>
                  <p>{commande.cp_code_postal || commande.cpCodePostal} {commande.cp_ville || commande.cpVille}</p>
                </div>
              </div>
            )}
          </div>

          {/* Articles commandés */}
          <div>
            <h4 className="font-bold text-gray-800 text-sm mb-3">Articles commandés</h4>
            <div className="space-y-2">
              {(commande.items || commande.commandesMenu || []).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-red-600 text-xs bg-red-100 px-2 py-1 rounded">
                      x{item.quantite}
                    </span>
                    <span className="font-medium text-gray-800">{item.nomProduit || item.produit?.nom || `Produit #${item.id_produit || item.idProduit}`}</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {((item.prix || item.prixUnitaire || 0) * item.quantite).toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Total */}
        <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
          <span className="text-base font-bold text-gray-700">Montant total</span>
          <span className="text-2xl font-black text-red-600">
            {Number(commande.total).toFixed(2)} €
          </span>
        </div>

      </div>
    </div>
  );
};