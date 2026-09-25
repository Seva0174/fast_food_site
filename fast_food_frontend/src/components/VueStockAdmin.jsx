import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/adminApi';
import { Truck, Upload, Plus, Minus, Trash2, CheckCircle2, AlertCircle, ShoppingCart, Eye, X } from 'lucide-react';

export function VueStockAdmin() {
  const [sousOnglet, setSousOnglet] = useState('fournisseurs');

  // États pour les Fournisseurs & Catalogues
  const [fournisseurs, setFournisseurs] = useState([]);
  const [fournisseurSelect, setFournisseurSelect] = useState('');
  const [catalogue, setCatalogue] = useState([]);
  const [nouveauFournisseur, setNouveauFournisseur] = useState('');

  // États pour les Commandes Fournisseurs
  const [commandes, setCommandes] = useState([]);
  const [panierCommande, setPanierCommande] = useState([]);

  // États UI / Modale / Fichier
  const [fichierCsv, setFichierCsv] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [commandeSelectionnee, setCommandeSelectionnee] = useState(null);
  const [detailsModal, setDetailsModal] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const afficherMessage = useCallback((texte, type = 'succes') => {
    setMessage({ texte, type });
    setTimeout(() => setMessage(null), 4000);
  }, []);

  const chargerFournisseurs = useCallback(async () => {
    try {
      const res = await adminApi.getFournisseurs();
      setFournisseurs(res.data);
      if (res.data.length > 0 && !fournisseurSelect) {
        setFournisseurSelect(res.data[0].id);
      }
    } catch {
      afficherMessage('Erreur lors du chargement des fournisseurs', 'erreur');
    }
  }, [fournisseurSelect, afficherMessage]);

  const chargerCatalogue = useCallback(async (idFournisseur) => {
    try {
      const res = await adminApi.getCatalogueFournisseur(idFournisseur);
      setCatalogue(res.data);
    } catch {
      afficherMessage('Erreur lors du chargement du catalogue', 'erreur');
    }
  }, [afficherMessage]);

  const chargerCommandes = useCallback(async () => {
    try {
      const res = await adminApi.getCommandesFournisseurs();
      setCommandes(res.data);
    } catch {
      afficherMessage('Erreur lors du chargement des commandes d\'achat', 'erreur');
    }
  }, [afficherMessage]);

  useEffect(() => {
    chargerFournisseurs();
    chargerCommandes();
  }, [chargerFournisseurs, chargerCommandes]);

  const handleChangerFournisseur = (idFournisseur) => {
    setFournisseurSelect(idFournisseur);
    setPanierCommande([]);
    if (idFournisseur) {
      chargerCatalogue(idFournisseur);
    } else {
      setCatalogue([]);
    }
  };

  const handleCreerFournisseur = async (e) => {
    e.preventDefault();
    if (!nouveauFournisseur.trim()) return;
    try {
      setLoading(true);
      const res = await adminApi.creerFournisseur({ nom: nouveauFournisseur });
      afficherMessage('Fournisseur créé avec succès');
      setNouveauFournisseur('');
      await chargerFournisseurs();
      handleChangerFournisseur(res.data.id);
    } catch {
      afficherMessage('Erreur lors de la création du fournisseur', 'erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleSupprimerFournisseur = async (id) => {
    if (!window.confirm('Voulez-vous supprimer ce fournisseur, son catalogue et son historique ?')) return;
    try {
      setLoading(true);
      await adminApi.supprimerFournisseur(id);
      afficherMessage('Fournisseur supprimé');
      handleChangerFournisseur('');
      await chargerFournisseurs();
    } catch {
      afficherMessage('Erreur lors de la suppression du fournisseur', 'erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadCsv = async (e) => {
    e.preventDefault();
    if (!fichierCsv || !fournisseurSelect) return;

    try {
      setLoading(true);
      const res = await adminApi.uploadCatalogueCsv(fournisseurSelect, fichierCsv);
      setCatalogue(res.data);
      afficherMessage('Catalogue mis à jour avec succès via le fichier CSV');
      setFichierCsv(null);
    } catch {
      afficherMessage('Erreur lors de l\'import du fichier CSV', 'erreur');
    } finally {
      setLoading(false);
    }
  };

  const ajouterAuPanierCommande = (article) => {
    const existe = panierCommande.find(item => item.idStock === article.idStock);
    if (existe) {
      setPanierCommande(panierCommande.map(item =>
        item.idStock === article.idStock ? { ...item, quantite: item.quantite + 1 } : item
      ));
    } else {
      setPanierCommande([...panierCommande, {
        idStock: article.idStock,
        nom: article.matierePremiereNom,
        quantite: 1,
        prixUnitaire: article.prixUnitaire
      }]);
    }
  };

  const modifierQuantitePanier = (idStock, nouvelleQuantite) => {
    const val = parseInt(nouvelleQuantite, 10);
    if (isNaN(val) || val <= 0) {
      setPanierCommande(panierCommande.filter(item => item.idStock !== idStock));
    } else {
      setPanierCommande(panierCommande.map(item =>
        item.idStock === idStock ? { ...item, quantite: val } : item
      ));
    }
  };

  const incQuantite = (idStock) => {
    setPanierCommande(panierCommande.map(item =>
      item.idStock === idStock ? { ...item, quantite: item.quantite + 1 } : item
    ));
  };

  const decQuantite = (idStock) => {
    setPanierCommande(panierCommande.map(item => {
      if (item.idStock === idStock) {
        return item.quantite > 1 ? { ...item, quantite: item.quantite - 1 } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const handleValiderCommande = async () => {
    if (!fournisseurSelect || panierCommande.length === 0) return;

    const payload = {
      idFournisseur: Number(fournisseurSelect),
      items: panierCommande.map(item => ({
        idStock: item.idStock,
        quantite: item.quantite,
        prixUnitaire: item.prixUnitaire
      }))
    };

    try {
      setLoading(true);
      await adminApi.creerCommandeFournisseur(payload);
      afficherMessage('Commande d\'approvisionnement envoyée !');
      setPanierCommande([]);
      chargerCommandes();
    } catch {
      afficherMessage('Erreur lors du passage de la commande', 'erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleChangerStatutCommande = async (idCommande, statut) => {
    try {
      await adminApi.changerStatutCommandeFournisseur(idCommande, statut);
      afficherMessage(statut === 'recue' ? 'Commande reçue : le stock a été crédité !' : 'Statut mis à jour');
      chargerCommandes();
    } catch {
      afficherMessage('Erreur lors du changement de statut', 'erreur');
    }
  };

  const handleVoirDetails = async (cmd) => {
    try {
      setLoadingDetails(true);
      setCommandeSelectionnee(cmd);
      const res = await adminApi.getDetailsCommandeFournisseur(cmd.id);
      setDetailsModal(res.data);
    } catch {
      afficherMessage('Erreur lors du chargement des détails', 'erreur');
    } finally {
      setLoadingDetails(false);
    }
  };

  const catalogueAffiche = fournisseurSelect ? catalogue : [];

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gestion des Stocks & Approvisionnement</h2>
          <p className="text-sm text-gray-500">Gérez les réapprovisionnements en matières premières</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setSousOnglet('fournisseurs')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
              sousOnglet === 'fournisseurs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Fournisseurs & Commandes
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
          message.type === 'erreur' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message.type === 'erreur' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {message.texte}
        </div>
      )}

      {sousOnglet === 'fournisseurs' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-semibold text-gray-700">Sélectionner un Fournisseur</label>
              <div className="flex gap-2">
                <select
                  value={fournisseurSelect}
                  onChange={(e) => handleChangerFournisseur(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm font-medium focus:ring-2 focus:ring-red-500"
                >
                  <option value="">-- Choisir un fournisseur --</option>
                  {fournisseurs.map(f => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </select>
                {fournisseurSelect && (
                  <button
                    onClick={() => handleSupprimerFournisseur(fournisseurSelect)}
                    title="Supprimer ce fournisseur"
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleCreerFournisseur} className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700">Nouveau Fournisseur</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nom du fournisseur"
                  value={nouveauFournisseur}
                  onChange={(e) => setNouveauFournisseur(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-1 text-sm font-medium transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {fournisseurSelect && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-red-600" />
                    Catalogue des articles du fournisseur
                  </h3>

                  <form onSubmit={handleUploadCsv} className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setFichierCsv(e.target.files[0])}
                      className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                    <button
                      type="submit"
                      disabled={!fichierCsv || loading}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded-lg flex items-center gap-1 transition disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" /> Import CSV
                    </button>
                  </form>
                </div>

                {catalogueAffiche.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500 text-sm">
                    Aucun article au catalogue. Importez un fichier CSV (format : <code className="bg-gray-200 px-1 py-0.5 rounded">nom_matiere;prix_unitaire</code>).
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                    {catalogueAffiche.map((item) => (
                      <div key={item.id} className="p-3 border rounded-lg bg-gray-50 flex justify-between items-center hover:border-gray-300 transition">
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{item.matierePremiereNom}</p>
                          <p className="text-xs text-gray-500">{Number(item.prixUnitaire).toFixed(2)} € / unité</p>
                        </div>
                        <button
                          onClick={() => ajouterAuPanierCommande(item)}
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-lg transition flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Ajouter
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2 border-b pb-2">
                    <ShoppingCart className="w-4 h-4 text-red-600" />
                    Bon de commande
                  </h4>

                  {panierCommande.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-6">Aucun article sélectionné</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {panierCommande.map((item) => (
                        <div key={item.idStock} className="flex justify-between items-center text-xs bg-white p-2 rounded border gap-2">
                          <span className="font-medium text-gray-800 truncate max-w-[110px]">{item.nom}</span>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => decQuantite(item.idStock)}
                              className="p-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <input
                              type="text"
                              value={item.quantite}
                              onChange={(e) => modifierQuantitePanier(item.idStock, e.target.value)}
                              className="w-10 border rounded py-0.5 text-center font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                            />

                            <button
                              onClick={() => incQuantite(item.idStock)}
                              className="p-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-bold text-gray-700 min-w-[50px] text-right">
                            {(item.quantite * item.prixUnitaire).toFixed(2)} €
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {panierCommande.length > 0 && (
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm font-bold text-gray-800">
                      <span>Total HT :</span>
                      <span className="text-red-600">
                        {panierCommande.reduce((acc, i) => acc + (i.quantite * i.prixUnitaire), 0).toFixed(2)} €
                      </span>
                    </div>
                    <button
                      onClick={handleValiderCommande}
                      disabled={loading}
                      className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition"
                    >
                      Valider la commande
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-bold text-gray-800 text-sm">Historique des commandes d'approvisionnement</h3>
            {commandes.length === 0 ? (
              <p className="text-xs text-gray-500">Aucune commande enregistrée.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 border-b">
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Fournisseur</th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Montant</th>
                      <th className="p-2.5">Statut</th>
                      <th className="p-2.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {commandes.map((cmd) => (
                      <tr key={cmd.id} className="hover:bg-gray-50">
                        <td className="p-2.5 font-bold">#{cmd.id}</td>
                        <td className="p-2.5">{cmd.fournisseurNom}</td>
                        <td className="p-2.5">{cmd.dateCommande}</td>
                        <td className="p-2.5 font-semibold text-red-600">{Number(cmd.montantTotal || 0).toFixed(2)} €</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            cmd.status === 'recue' ? 'bg-green-100 text-green-800' :
                            cmd.status === 'expediee' ? 'bg-blue-100 text-blue-800' :
                            cmd.status === 'annulee' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {cmd.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-2.5 flex items-center gap-2">
                          <button
                            onClick={() => handleVoirDetails(cmd)}
                            title="Voir les détails"
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <select
                            value={cmd.status}
                            onChange={(e) => handleChangerStatutCommande(cmd.id, e.target.value)}
                            className="bg-white border rounded p-1 text-xs font-medium cursor-pointer"
                          >
                            <option value="en_attente">En attente</option>
                            <option value="expediee">Expédiée</option>
                            <option value="recue">Reçue (Crédite le stock)</option>
                            <option value="annulee">Annulée</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fenêtre Modale pour afficher les détails d'une commande */}
      {commandeSelectionnee && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-gray-800 text-base">
                  Commande #{commandeSelectionnee.id}
                </h3>
                <p className="text-xs text-gray-500">{commandeSelectionnee.fournisseurNom} • {commandeSelectionnee.dateCommande}</p>
              </div>
              <button 
                onClick={() => setCommandeSelectionnee(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="text-center py-6 text-xs text-gray-500">Chargement des détails...</div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 border-b text-gray-600 font-semibold">
                    <tr>
                      <th className="p-2.5">Article</th>
                      <th className="p-2.5 text-center">Qté</th>
                      <th className="p-2.5 text-right">P.U</th>
                      <th className="p-2.5 text-right">Sous-total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {detailsModal.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-2.5 font-medium text-gray-800">{item.matierePremiereNom}</td>
                        <td className="p-2.5 text-center">{item.quantite}</td>
                        <td className="p-2.5 text-right text-gray-500">{Number(item.prixUnitaire).toFixed(2)} €</td>
                        <td className="p-2.5 text-right font-semibold text-gray-800">{Number(item.sousTotal).toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t text-sm font-bold">
              <span className="text-gray-700">Total Commande :</span>
              <span className="text-red-600 text-base">
                {Number(commandeSelectionnee.montantTotal || 0).toFixed(2)} €
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}