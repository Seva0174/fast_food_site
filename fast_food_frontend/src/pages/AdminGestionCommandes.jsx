import { useState, useEffect } from 'react';
import { getAllCommandesApi, changerStatusCommandeApi } from '../api/commandeApi';
import { CommandeDetailModal } from '../components/CommandeDetailModal';
import { CommandeCard } from '../components/CommandeCard';
import { 
  RefreshCw, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Truck, 
  Store 
} from 'lucide-react';

const TOUS_LES_STATUTS = [
  { value: 'en_attente', label: 'En attente' },
  { value: 'en_preparation', label: 'En préparation' },
  { value: 'prete', label: 'Prête' },
  { value: 'livree', label: 'Livrée' },
  { value: 'retiree', label: 'Retirée' },
  { value: 'annulee', label: 'Annulée' },
];

export const AdminGestionCommandes = () => {
  const [commandes, setCommandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [commandeSelectionnee, setCommandeSelectionnee] = useState(null);

  // Filtres & Tri
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [filtreTypeRetrait, setFiltreTypeRetrait] = useState('tous');
  const [ordreTri, setOrdreTri] = useState('desc');
  const [recherche, setRecherche] = useState('');
  const [miseAJourEnCours, setMiseAJourEnCours] = useState(null);

  const chargerCommandes = async () => {
    setChargement(true);
    setErreur('');
    try {
      const data = await getAllCommandesApi();
      setCommandes(data);
    } catch (err) {
      setErreur('Impossible de charger les commandes.');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerCommandes();
  }, []);

  const handleChangerStatut = async (commandeId, nouveauStatut) => {
    setMiseAJourEnCours(commandeId);
    try {
      const commandeModifiee = await changerStatusCommandeApi(commandeId, nouveauStatut);
      setCommandes((prev) =>
        prev.map((c) => (c.id === commandeId ? commandeModifiee : c))
      );
      if (commandeSelectionnee?.id === commandeId) {
        setCommandeSelectionnee(commandeModifiee);
      }
    } catch (err) {
      alert('Erreur lors du changement de statut de la commande.');
    } finally {
      setMiseAJourEnCours(null);
    }
  };

  const commandesTraitees = commandes
    .filter((commande) => {
      const matchStatut = filtreStatut === 'tous' || commande.status === filtreStatut;
      const type = commande.typeRetrait || commande.type_retrait;
      const matchType = filtreTypeRetrait === 'tous' || type === filtreTypeRetrait;
      const matchRecherche =
        commande.id.toString().includes(recherche) ||
        commande.userEmail?.toLowerCase().includes(recherche.toLowerCase()) ||
        commande.nomClient?.toLowerCase().includes(recherche.toLowerCase());

      return matchStatut && matchType && matchRecherche;
    })
    .sort((a, b) => {
      const dateA = new Date(a.dateCreation || a.date_creation).getTime();
      const dateB = new Date(b.dateCreation || b.date_creation).getTime();
      return ordreTri === 'desc' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Gestion des Commandes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Suivez et mettez à jour l'état des commandes en temps réel.
          </p>
        </div>

        <button
          onClick={chargerCommandes}
          disabled={chargement}
          className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg shadow-sm transition"
        >
          <RefreshCw className={`w-4 h-4 ${chargement ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Barre de filtres, recherche et tri */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="N° de commande, client..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
              <button
                onClick={() => setFiltreTypeRetrait('tous')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  filtreTypeRetrait === 'tous'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFiltreTypeRetrait('livraison')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md transition ${
                  filtreTypeRetrait === 'livraison'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Truck className="w-3.5 h-3.5" /> Livraison
              </button>
              <button
                onClick={() => setFiltreTypeRetrait('click_and_collect')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md transition ${
                  filtreTypeRetrait === 'click_and_collect'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Store className="w-3.5 h-3.5" /> Retrait
              </button>
            </div>

            <button
              onClick={() => setOrdreTri(ordreTri === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 transition"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-red-600" />
              <span>{ordreTri === 'desc' ? 'Plus récentes en premier' : 'Plus anciennes en premier'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-gray-100 pb-1">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <button
            onClick={() => setFiltreStatut('tous')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition ${
              filtreStatut === 'tous'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tous ({commandes.length})
          </button>
          {TOUS_LES_STATUTS.map((st) => {
            const count = commandes.filter((c) => c.status === st.value).length;
            return (
              <button
                key={st.value}
                onClick={() => setFiltreStatut(st.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition ${
                  filtreStatut === st.value
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {st.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {erreur && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg mb-6 text-sm">
          {erreur}
        </div>
      )}

      {chargement ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-600 mb-2" />
          <p className="text-gray-500">Chargement des commandes...</p>
        </div>
      ) : commandesTraitees.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          Aucune commande correspondant aux filtres.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commandesTraitees.map((commande) => (
            <CommandeCard
              key={commande.id}
              commande={commande}
              onChangerStatut={handleChangerStatut}
              onVoirDetail={() => setCommandeSelectionnee(commande)}
              enCours={miseAJourEnCours === commande.id}
            />
          ))}
        </div>
      )}

      {commandeSelectionnee && (
        <CommandeDetailModal
          commande={commandeSelectionnee}
          onClose={() => setCommandeSelectionnee(null)}
        />
      )}
    </div>
  );
};