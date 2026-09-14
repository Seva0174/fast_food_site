import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { CommandeDetailModal } from '../components/CommandeDetailModal';
import { User, MapPin, Package, Clock, History, Eye, CheckCircle2, Save } from 'lucide-react';
import api from '../api/axios';

export const PageUser = () => {
  const { user } = useContext(AuthContext);

  const [adresse, setAdresse] = useState({
    rue: '',
    ville: '',
    codePostal: ''
  });
  const [isSavedAdresse, setIsSavedAdresse] = useState(false);

  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [activeTab, setActiveTab] = useState('encours'); // 'encours' ou 'historique'

  // Charger les adresses et commandes
  useEffect(() => {
    // Charger adresse enregistrée (LocalStorage ou depuis l'API)
    const savedAdresse = localStorage.getItem(`adresse_user_${user?.id}`);
    if (savedAdresse) {
      setAdresse(JSON.parse(savedAdresse));
    }

    // Charger les commandes de l'utilisateur
    const fetchCommandes = async () => {
      try {
        const response = await api.get('/commandes/mes-commandes');        setCommandes(response.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des commandes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommandes();
  }, [user]);

  const handleSaveAdresse = (e) => {
    e.preventDefault();
    localStorage.setItem(`adresse_user_${user?.id}`, JSON.stringify(adresse));
    setIsSavedAdresse(true);
    setTimeout(() => setIsSavedAdresse(false), 3000);
  };

  // Séparation des commandes
  const commandesEnCours = commandes.filter(c => ['en_attente', 'en_preparation', 'prete'].includes(c.status));
  const commandesPassees = commandes.filter(c => ['livree', 'annulee'].includes(c.status));

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Titre Page */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <User className="w-8 h-8 text-red-600" />
          <span>Espace Mon Compte</span>
        </h1>
      </div>

      {/* Grille Principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Colonne Gauche : Infos compte + Formulaire Adresse */}
        <div className="space-y-6">
          
          {/* Infos Compte */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Mes Informations</h2>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Nom</p>
              <p className="font-semibold text-gray-800">{user?.nom || 'Non renseigné'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Email</p>
              <p className="font-medium text-gray-700">{user?.email}</p>
            </div>
          </div>

          {/* Formulaire Adresse par défaut */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <MapPin className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-bold text-gray-800">Adresse par défaut</h2>
            </div>

            <form onSubmit={handleSaveAdresse} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Rue</label>
                <input
                  type="text"
                  required
                  placeholder="12 Rue de la Paix"
                  value={adresse.rue}
                  onChange={(e) => setAdresse({ ...adresse, rue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Code postal</label>
                  <input
                    type="text"
                    required
                    placeholder="75000"
                    value={adresse.codePostal}
                    onChange={(e) => setAdresse({ ...adresse, codePostal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Ville</label>
                  <input
                    type="text"
                    required
                    placeholder="Paris"
                    value={adresse.ville}
                    onChange={(e) => setAdresse({ ...adresse, ville: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-gray-900 hover:bg-black text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer l'adresse</span>
              </button>

              {isSavedAdresse && (
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 justify-center pt-1">
                  <CheckCircle2 className="w-4 h-4" /> Enregistrée avec succès !
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Colonne Droite : Suivi & Liste des Commandes */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabs Navigation */}
          <div className="flex gap-2 border-b border-gray-200 pb-2">
            <button
              onClick={() => setActiveTab('encours')}
              className={`px-4 py-2 font-bold text-sm rounded-xl transition flex items-center gap-2 ${
                activeTab === 'encours'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Commandes en cours ({commandesEnCours.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('historique')}
              className={`px-4 py-2 font-bold text-sm rounded-xl transition flex items-center gap-2 ${
                activeTab === 'historique'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Historique ({commandesPassees.length})</span>
            </button>
          </div>

          {/* Section Commandes en cours */}
          {activeTab === 'encours' && (
            <div className="space-y-4">
              {loading ? (
                <p className="text-gray-500 text-center py-8">Chargement des commandes...</p>
              ) : commandesEnCours.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl text-center border border-gray-100 space-y-3">
                  <Package className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-gray-600 font-medium">Aucune commande en cours pour le moment.</p>
                </div>
              ) : (
                commandesEnCours.map((cmd) => (
                  <div key={cmd.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-gray-900">Commande #{cmd.id}</span>
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                          {cmd.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Total : <span className="font-bold text-gray-800">{Number(cmd.total).toFixed(2)} €</span>
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedCommande(cmd)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                      <span>Détails</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Section Historique des commandes passées */}
          {activeTab === 'historique' && (
            <div className="space-y-4">
              {loading ? (
                <p className="text-gray-500 text-center py-8">Chargement de l'historique...</p>
              ) : commandesPassees.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl text-center border border-gray-100 space-y-3">
                  <History className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-gray-600 font-medium">Aucune commande passée enregistrée.</p>
                </div>
              ) : (
                commandesPassees.map((cmd) => (
                  <div key={cmd.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-gray-900">Commande #{cmd.id}</span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          cmd.status === 'livree' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {cmd.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Total : <span className="font-bold text-gray-800">{Number(cmd.total).toFixed(2)} €</span>
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedCommande(cmd)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                      <span>Détails</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>

      {/* Fenêtre Modal superposée pour voir le détail de la commande sélectionnée */}
      {selectedCommande && (
        <CommandeDetailModal
          commande={selectedCommande}
          onClose={() => setSelectedCommande(null)}
        />
      )}

    </div>
  );
};