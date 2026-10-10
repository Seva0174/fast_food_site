import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';

const messageErreur = (err, parDefaut) => err?.response?.data?.message || parDefaut;

export function GestionFormuleModal({ formule, produits, onClose, onRefresh }) {
  const [groupes, setGroupes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  // Formulaire pour créer un NOUVEL emplacement
  const [groupeForm, setGroupeForm] = useState({ nom: '', minSelection: 1, maxSelection: 1 });

  // Édition inline d'un emplacement existant
  const [editingGroupeId, setEditingGroupeId] = useState(null);
  const [editGroupeForm, setEditGroupeForm] = useState({ nom: '', minSelection: 1, maxSelection: 1, ordre: 1 });

  // Ajout d'un produit dans un emplacement
  const [activeGroupeId, setActiveGroupeId] = useState(null);
  const [produitForm, setProduitForm] = useState({ idProduit: '', surcout: '0' });

  // Édition inline du surcoût d'un produit
  const [editingLienId, setEditingLienId] = useState(null);
  const [editSurcout, setEditSurcout] = useState('0');

  const chargerGroupes = async (afficherChargement = false) => {
    if (afficherChargement) setLoading(true);
    setErreur(null);
    try {
      const res = await adminApi.getGroupesFormule(formule.id);
      setGroupes(res.data);
    } catch (err) {
      console.error('Erreur lors de la récupération de la composition du menu :', err);
      setErreur('Impossible de charger la composition de ce menu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formule?.id) {
      chargerGroupes(true);
    }
  }, [formule]);

  const rafraichir = async () => {
    await chargerGroupes();
    if (onRefresh) onRefresh();
  };

  // --- EMPLACEMENTS ---
  const handleCreerGroupe = async (e) => {
    e.preventDefault();
    try {
      await adminApi.creerGroupeFormule(formule.id, {
        nom: groupeForm.nom,
        minSelection: parseInt(groupeForm.minSelection, 10),
        maxSelection: parseInt(groupeForm.maxSelection, 10),
      });
      setGroupeForm({ nom: '', minSelection: 1, maxSelection: 1 });
      await rafraichir();
    } catch (err) {
      console.error("Erreur création emplacement :", err);
      alert(messageErreur(err, "Erreur lors de la création de l'emplacement."));
    }
  };

  const handleStartEditGroupe = (grp) => {
    setEditingGroupeId(grp.id);
    setEditGroupeForm({
      nom: grp.nom,
      minSelection: grp.minSelection,
      maxSelection: grp.maxSelection,
      ordre: grp.ordre,
    });
  };

  const handleSaveInlineGroupe = async (idGroupe) => {
    try {
      await adminApi.modifierGroupeFormule(idGroupe, {
        nom: editGroupeForm.nom,
        minSelection: parseInt(editGroupeForm.minSelection, 10),
        maxSelection: parseInt(editGroupeForm.maxSelection, 10),
        ordre: parseInt(editGroupeForm.ordre, 10),
      });
      setEditingGroupeId(null);
      await rafraichir();
    } catch (err) {
      console.error('Erreur modification emplacement :', err);
      alert(messageErreur(err, "Erreur lors de la modification de l'emplacement."));
    }
  };

  const handleSupprimerGroupe = async (idGroupe, nom) => {
    if (window.confirm(`Supprimer l'emplacement "${nom}" et la liste de ses produits ?`)) {
      try {
        await adminApi.supprimerGroupeFormule(idGroupe);
        await rafraichir();
      } catch (err) {
        console.error('Erreur suppression emplacement :', err);
        alert(messageErreur(err, "Erreur lors de la suppression de l'emplacement."));
      }
    }
  };

  // --- PRODUITS D'UN EMPLACEMENT ---
  const produitsAjoutables = (grp) =>
    (produits || []).filter(
      (p) => !p.estFormule && !grp.produits.some((lien) => lien.idProduit === p.id)
    );

  const produitsParCategorie = (grp) => {
    const parCategorie = {};
    produitsAjoutables(grp).forEach((p) => {
      const nomCategorie = p.categorie?.nom || 'Autres';
      if (!parCategorie[nomCategorie]) parCategorie[nomCategorie] = [];
      parCategorie[nomCategorie].push(p);
    });
    return Object.entries(parCategorie);
  };

  const handleAjouterProduit = async (e, idGroupe) => {
    e.preventDefault();
    if (!produitForm.idProduit) return;

    try {
      await adminApi.ajouterProduitGroupeFormule(idGroupe, {
        idProduit: parseInt(produitForm.idProduit, 10),
        surcout: parseFloat(produitForm.surcout || 0),
      });
      setProduitForm({ idProduit: '', surcout: '0' });
      setActiveGroupeId(null);
      await rafraichir();
    } catch (err) {
      console.error('Erreur ajout produit :', err);
      alert(messageErreur(err, "Erreur lors de l'ajout du produit."));
    }
  };

  const handleSaveSurcout = async (idLien) => {
    try {
      await adminApi.modifierSurcoutFormule(idLien, { surcout: parseFloat(editSurcout || 0) });
      setEditingLienId(null);
      await rafraichir();
    } catch (err) {
      console.error('Erreur modification surcoût :', err);
      alert(messageErreur(err, 'Erreur lors de la modification du surcoût.'));
    }
  };

  const handleRetirerProduit = async (idLien) => {
    try {
      await adminApi.retirerProduitGroupeFormule(idLien);
      await rafraichir();
    } catch (err) {
      console.error('Erreur retrait produit :', err);
      alert(messageErreur(err, 'Erreur lors du retrait du produit.'));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              Composition du menu — <span className="text-red-600">{formule.nom}</span>
            </h3>
            <p className="text-xs text-gray-500">
              Définissez les emplacements du menu (ex : Ton burger, Ta boisson) et les produits proposés
              dans chacun. Le surcoût s'ajoute au prix de base quand le client choisit ce produit.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold px-2"
          >
            &times;
          </button>
        </div>

        {loading && <p className="text-gray-500 text-sm">Chargement de la composition...</p>}
        {erreur && <p className="text-red-500 text-sm">{erreur}</p>}

        {!loading && !erreur && (
          <div className="space-y-6">
            {/* CREATION D'UN EMPLACEMENT */}
            <form onSubmit={handleCreerGroupe} className="bg-gray-50 p-4 rounded-lg border space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                + Nouvel emplacement
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    placeholder="ex : Ton accompagnement"
                    value={groupeForm.nom}
                    onChange={(e) => setGroupeForm({ ...groupeForm, nom: e.target.value })}
                    className="w-full border rounded px-3 py-1.5 text-sm bg-white focus:ring-1 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Min. de choix</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={groupeForm.minSelection}
                    onChange={(e) => setGroupeForm({ ...groupeForm, minSelection: e.target.value })}
                    className="w-full border rounded px-3 py-1.5 text-sm bg-white focus:ring-1 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Max. de choix</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={groupeForm.maxSelection}
                    onChange={(e) => setGroupeForm({ ...groupeForm, maxSelection: e.target.value })}
                    className="w-full border rounded px-3 py-1.5 text-sm bg-white focus:ring-1 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors"
                >
                  Créer l'emplacement
                </button>
              </div>
            </form>

            {/* LISTE DES EMPLACEMENTS */}
            <div className="space-y-4">
              {groupes.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-6">
                  Aucun emplacement. Tant que le menu n'en possède pas, il reste indisponible pour les clients.
                </p>
              ) : (
                groupes.map((grp) => {
                  const estObligatoire = grp.minSelection > 0;
                  const aucunDisponible = !grp.produits.some((lien) => lien.estDispo);
                  const categoriesAjoutables = produitsParCategorie(grp);

                  return (
                    <div key={grp.id} className="border rounded-lg overflow-hidden">
                      {/* EN-TETE DE L'EMPLACEMENT */}
                      <div className="bg-gray-50 px-4 py-3 border-b">
                        {editingGroupeId === grp.id ? (
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
                            <div className="col-span-2">
                              <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Nom</label>
                              <input
                                type="text"
                                value={editGroupeForm.nom}
                                onChange={(e) => setEditGroupeForm({ ...editGroupeForm, nom: e.target.value })}
                                className="w-full border rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-red-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Min</label>
                              <input
                                type="number"
                                min="0"
                                value={editGroupeForm.minSelection}
                                onChange={(e) => setEditGroupeForm({ ...editGroupeForm, minSelection: e.target.value })}
                                className="w-full border rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-red-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Max</label>
                              <input
                                type="number"
                                min="1"
                                value={editGroupeForm.maxSelection}
                                onChange={(e) => setEditGroupeForm({ ...editGroupeForm, maxSelection: e.target.value })}
                                className="w-full border rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-red-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Ordre</label>
                              <input
                                type="number"
                                min="0"
                                value={editGroupeForm.ordre}
                                onChange={(e) => setEditGroupeForm({ ...editGroupeForm, ordre: e.target.value })}
                                className="w-full border rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-red-500 outline-none"
                              />
                            </div>
                            <div className="col-span-2 sm:col-span-5 flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingGroupeId(null)}
                                className="px-2.5 py-1 border text-xs rounded text-gray-600 bg-white hover:bg-gray-50"
                              >
                                Annuler
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveInlineGroupe(grp.id)}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium"
                              >
                                Enregistrer
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="font-bold text-gray-800 text-sm">{grp.nom}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  estObligatoire
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                }`}
                              >
                                {estObligatoire ? `Obligatoire (${grp.minSelection} min)` : 'Optionnel'}
                              </span>
                              <span className="text-xs text-gray-500">
                                Max : <strong className="text-gray-700">{grp.maxSelection}</strong>
                              </span>
                              <span className="text-xs text-gray-400">Ordre : {grp.ordre}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleStartEditGroupe(grp)}
                                className="text-xs text-blue-600 hover:underline font-medium"
                              >
                                Modifier
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                type="button"
                                onClick={() => handleSupprimerGroupe(grp.id, grp.nom)}
                                className="text-xs text-red-600 hover:underline font-medium"
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* PRODUITS DE L'EMPLACEMENT */}
                      <div className="p-4 space-y-3">
                        {grp.produits.length < grp.minSelection && (
                          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                            Cet emplacement propose moins de produits que le minimum de choix demandé : les
                            clients ne pourront pas valider ce menu.
                          </p>
                        )}
                        {estObligatoire && grp.produits.length > 0 && aucunDisponible && (
                          <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                            Tous les produits de cet emplacement sont en rupture : le menu est indisponible.
                          </p>
                        )}

                        {grp.produits.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">
                            Aucun produit dans cet emplacement. Ajoutez-en un ci-dessous.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {grp.produits.map((lien) => (
                              <div
                                key={lien.id}
                                className="border rounded px-3 py-2 bg-gray-50/60 text-xs space-y-1"
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <span className="font-semibold text-gray-800">{lien.nomProduit}</span>
                                    {!lien.estDispo && (
                                      <span className="ml-2 text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                                        Rupture
                                      </span>
                                    )}
                                    <div className="text-[11px] text-gray-500">
                                      Prix seul : {Number(lien.prixProduit).toFixed(2)} €
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRetirerProduit(lien.id)}
                                    className="text-red-500 hover:text-red-700 font-bold px-1 text-sm"
                                    title="Retirer ce produit de l'emplacement"
                                  >
                                    &times;
                                  </button>
                                </div>

                                {editingLienId === lien.id ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={editSurcout}
                                      onChange={(e) => setEditSurcout(e.target.value)}
                                      className="w-20 border rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-red-500 outline-none"
                                    />
                                    <span className="text-gray-500">€</span>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveSurcout(lien.id)}
                                      className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-[11px] font-medium"
                                    >
                                      OK
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingLienId(null)}
                                      className="px-2 py-1 border rounded text-[11px] text-gray-600 bg-white hover:bg-gray-50"
                                    >
                                      Annuler
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-600">
                                      Surcoût dans le menu :{' '}
                                      <strong className={Number(lien.surcout) > 0 ? 'text-green-700' : 'text-gray-700'}>
                                        {Number(lien.surcout) > 0 ? `+${Number(lien.surcout).toFixed(2)} €` : 'aucun'}
                                      </strong>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingLienId(lien.id);
                                        setEditSurcout(String(lien.surcout ?? 0));
                                      }}
                                      className="text-blue-600 hover:underline font-medium"
                                    >
                                      Modifier
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* AJOUT D'UN PRODUIT */}
                        {activeGroupeId === grp.id ? (
                          <form
                            onSubmit={(e) => handleAjouterProduit(e, grp.id)}
                            className="bg-red-50/50 border border-red-200 p-3 rounded-md space-y-2 mt-2"
                          >
                            <h5 className="text-[11px] font-bold text-red-800 uppercase">
                              Ajouter un produit à "{grp.nom}"
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Produit</label>
                                <select
                                  required
                                  value={produitForm.idProduit}
                                  onChange={(e) => setProduitForm({ ...produitForm, idProduit: e.target.value })}
                                  className="w-full border rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-red-500 outline-none"
                                >
                                  <option value="">-- Sélectionner --</option>
                                  {categoriesAjoutables.map(([nomCategorie, liste]) => (
                                    <optgroup key={nomCategorie} label={nomCategorie}>
                                      {liste.map((p) => (
                                        <option key={p.id} value={p.id}>
                                          {p.nom} ({Number(p.prix).toFixed(2)} €)
                                        </option>
                                      ))}
                                    </optgroup>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">
                                  Surcoût dans le menu (€)
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={produitForm.surcout}
                                  onChange={(e) => setProduitForm({ ...produitForm, surcout: e.target.value })}
                                  className="w-full border rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-red-500 outline-none"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setActiveGroupeId(null)}
                                className="px-2.5 py-1 border text-xs rounded text-gray-600 bg-white hover:bg-gray-50"
                              >
                                Annuler
                              </button>
                              <button
                                type="submit"
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium"
                              >
                                Ajouter le produit
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveGroupeId(grp.id);
                              setProduitForm({ idProduit: '', surcout: '0' });
                            }}
                            className="text-xs text-red-600 hover:text-red-700 font-semibold border border-red-200 hover:border-red-300 px-3 py-1 rounded bg-white transition-colors"
                          >
                            + Ajouter un produit
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end border-t pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}