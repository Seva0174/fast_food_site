import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/adminApi';
import { Package, Edit2, Save, X, AlertTriangle, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react';

export function VueStockActuel() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Édition
  const [stockEnEdition, setStockEnEdition] = useState(null);
  const [formQuantite, setFormQuantite] = useState('');
  const [formUnite, setFormUnite] = useState('');

  // Ajout
  const [afficherFormAjout, setAfficherFormAjout] = useState(false);
  const [nouveauNom, setNouveauNom] = useState('');
  const [nouvelleQuantite, setNouvelleQuantite] = useState('0');
  const [nouvelleUnite, setNouvelleUnite] = useState('unite');

  const afficherMessage = useCallback((texte, type = 'succes') => {
    setMessage({ texte, type });
    setTimeout(() => setMessage(null), 5000);
  }, []);

  const chargerStocks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getMatieresPremieres();
      setStocks(res.data);
    } catch {
      afficherMessage('Erreur lors du chargement des stocks', 'erreur');
    } finally {
      setLoading(false);
    }
  }, [afficherMessage]);

  useEffect(() => {
    chargerStocks();
  }, [chargerStocks]);

  const demarrerEdition = (item) => {
    setStockEnEdition(item.id);
    setFormQuantite(item.quantite);
    setFormUnite(item.uniteMesure || 'unite');
  };

  const annulerEdition = () => {
    setStockEnEdition(null);
    setFormQuantite('');
    setFormUnite('');
  };

  const sauvegarderStock = async (id) => {
    try {
      setLoading(true);
      await adminApi.modifierStock(id, {
        quantite: Number(formQuantite),
        uniteMesure: formUnite
      });
      afficherMessage('Stock mis à jour avec succès');
      setStockEnEdition(null);
      await chargerStocks();
    } catch {
      afficherMessage('Erreur lors de la mise à jour du stock', 'erreur');
    } finally {
      setLoading(false);
    }
  };

  const ajouterMatierePremiere = async (e) => {
    e.preventDefault();
    if (!nouveauNom.trim()) {
      afficherMessage('Le nom de la matière première est obligatoire', 'erreur');
      return;
    }
    try {
      setLoading(true);
      await adminApi.creerMatierePremiere({
        nom: nouveauNom.trim(),
        quantite: Number(nouvelleQuantite),
        uniteMesure: nouvelleUnite
      });
      afficherMessage('Matière première ajoutée avec succès');
      setNouveauNom('');
      setNouvelleQuantite('0');
      setNouvelleUnite('unite');
      setAfficherFormAjout(false);
      await chargerStocks();
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de la création de la matière première";
      afficherMessage(msg, 'erreur');
    } finally {
      setLoading(false);
    }
  };

  const supprimerMatierePremiere = async (id, nom) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer "${nom}" ?`)) return;
    try {
      setLoading(true);
      await adminApi.supprimerMatierePremiere(id);
      afficherMessage('Matière première supprimée');
      await chargerStocks();
    } catch (err) {
      const msg = err.response?.data?.message || "Impossible de supprimer cette matière première (utilisée dans une recette ou commande).";
      afficherMessage(msg, 'erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
          message.type === 'erreur' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message.type === 'erreur' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {message.texte}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-base">
          <Package className="w-5 h-5 text-red-600" />
          Niveaux de stock actuels
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAfficherFormAjout(!afficherFormAjout)}
            className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1 font-semibold"
          >
            <Plus className="w-4 h-4" /> Ajouter Ingrédient
          </button>
          <button
            onClick={chargerStocks}
            disabled={loading}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition"
          >
            Actualiser
          </button>
        </div>
      </div>

      {/* Formulaire d'ajout */}
      {afficherFormAjout && (
        <form onSubmit={ajouterMatierePremiere} className="p-4 bg-gray-50 border rounded-xl space-y-3">
          <h4 className="text-xs font-bold text-gray-700">Nouvelle Matière Première</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Nom (ex: Steak 150g)"
              value={nouveauNom}
              onChange={(e) => setNouveauNom(e.target.value)}
              className="border p-2 rounded-lg text-xs"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Quantité initiale"
              value={nouvelleQuantite}
              onChange={(e) => setNouvelleQuantite(e.target.value)}
              className="border p-2 rounded-lg text-xs"
              required
            />
            <select
              value={nouvelleUnite}
              onChange={(e) => setNouvelleUnite(e.target.value)}
              className="border p-2 rounded-lg text-xs bg-white"
            >
              <option value="unite">unité(s)</option>
              <option value="g">g (grammes)</option>
              <option value="kg">kg (kilos)</option>
              <option value="ml">ml (millilitres)</option>
              <option value="L">L (litres)</option>
              <option value="tranche">tranche(s)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAfficherFormAjout(false)}
              className="px-3 py-1.5 text-xs text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 text-xs text-white bg-green-600 hover:bg-green-700 rounded-lg transition font-semibold"
            >
              Enregistrer
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 border-b">
              <th className="p-3">ID</th>
              <th className="p-3">Ingrédient / Matière Première</th>
              <th className="p-3">Quantité en Stock</th>
              <th className="p-3">Unité</th>
              <th className="p-3 text-center">État</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {stocks.map((item) => {
              const isEdition = stockEnEdition === item.id;
              const enAlerte = Number(item.quantite) <= 5;

              return (
                <tr key={item.id} className={`hover:bg-gray-50 transition ${enAlerte ? 'bg-amber-50/50' : ''}`}>
                  <td className="p-3 font-bold text-gray-500">#{item.id}</td>
                  <td className="p-3 font-semibold text-gray-800">{item.nom}</td>

                  <td className="p-3">
                    {isEdition ? (
                      <input
                        type="number"
                        step="0.01"
                        value={formQuantite}
                        onChange={(e) => setFormQuantite(e.target.value)}
                        className="w-24 border rounded p-1 text-xs font-semibold focus:ring-1 focus:ring-red-500"
                      />
                    ) : (
                      <span className="font-bold text-sm text-gray-800">
                        {Number(item.quantite).toLocaleString('fr-FR')}
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    {isEdition ? (
                      <select
                        value={formUnite}
                        onChange={(e) => setFormUnite(e.target.value)}
                        className="border rounded p-1 text-xs font-medium focus:ring-1 focus:ring-red-500 bg-white"
                      >
                        <option value="unite">unité(s)</option>
                        <option value="g">g (grammes)</option>
                        <option value="kg">kg (kilos)</option>
                        <option value="ml">ml (millilitres)</option>
                        <option value="L">L (litres)</option>
                        <option value="tranche">tranche(s)</option>
                      </select>
                    ) : (
                      <span className="text-gray-500 font-medium">{item.uniteMesure || 'unite'}</span>
                    )}
                  </td>

                  <td className="p-3 text-center">
                    {enAlerte ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-100 text-amber-800">
                        <AlertTriangle className="w-3 h-3" /> Bas
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] bg-green-100 text-green-800">
                        OK
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-right">
                    {isEdition ? (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => sauvegarderStock(item.id)}
                          className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
                          title="Enregistrer"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={annulerEdition}
                          className="p-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition"
                          title="Annuler"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => demarrerEdition(item)}
                          className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                          title="Modifier manuellement"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => supprimerMatierePremiere(item.id, item.nom)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}