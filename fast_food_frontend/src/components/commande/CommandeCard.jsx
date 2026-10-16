import { Store, Truck, Eye } from 'lucide-react';
import { memo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bouton } from '../ui/bouton';
import {
  dateCommande,
  estClickAndCollect,
  heureCommande,
  nombreArticles,
  statutsProposes,
} from '../../lib/commande';

export const CommandeCardBase = ({ commande, onChangerStatut, onVoirDetail, enCours }) => {
  const retrait = estClickAndCollect(commande);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between p-5 space-y-4">
      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="font-extrabold text-lg text-gray-900">Commande #{commande.id}</span>
            <p className="text-xs text-gray-500">
              Passée à {heureCommande(commande)} ({dateCommande(commande)})
            </p>
          </div>

          {retrait ? (
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
          <p className="font-semibold text-gray-800">Client : {commande.nomClient}</p>
          <p>
            {nombreArticles(commande)} article(s) • Total :{' '}
            <span className="font-bold text-red-600">{Number(commande.total).toFixed(2)} €</span>
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Changer le statut :
          </label>
          <Select
            value={commande.status}
            onValueChange={(statut) => onChangerStatut(commande.id, statut)}
            disabled={enCours}
          >
            <SelectTrigger className="w-full bg-gray-50 border-gray-300 text-gray-800 text-xs font-semibold rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statutsProposes(commande).map((statut) => (
                <SelectItem
                  key={statut.value}
                  value={statut.value}
                  className="text-xs font-semibold"
                >
                  {statut.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Bouton variante="neutre" taille="xs" className="w-full" onClick={() => onVoirDetail(commande)}>
          <Eye className="w-4 h-4" /> Voir les détails
        </Bouton>
      </div>
    </div>
  );
};

export const CommandeCard = memo(CommandeCardBase);