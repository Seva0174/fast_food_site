import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';

export function GestionOptionsModal({ produit, matieresPremieres, onClose, onRefresh }) {
  const [groupes, setGroupes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  // Formulaire pour créer un NOUVEAU groupe
  const [groupeForm, setGroupeForm] = useState({
    nom: '',
    minSelection: 1,
    maxSelection: 1,
  });

  // État pour l'ÉDITION INLINE d'un groupe existant
  const [editingGroupeId, setEditingGroupeId] = useState(null);
  const [editGroupeForm, setEditGroupeForm] = useState({
    nom: '',
    minSelection: 1,
    maxSelection: 1,
  });

  // Formulaire pour ajouter une option dans un groupe
  const [activeGroupeId, setActiveGroupeId] = useState(null);
  const [itemForm, setItemForm] = useState({
    nom: '',
    idMatiere: '',
    quantiteDeduite: '1',
    surcout: '0',
  });

  const chargerGroupes = async () => {
    setLoading(true);
    setErreur(null);
    try {
      const res = await adminApi.getGroupesOptionsByProduit(produit.id);
      setGroupes(res.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des groupes d'options :", err);
      setErreur("Impossible de charger les options de ce produit.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (produit?.id) {
      chargerGroupes();
    }
  }, [produit]);

  // --- GESTION CREATION GROUPE ---
  const handleCreerGroupe = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nom: groupeForm.nom,
        minSelection: parseInt(groupeForm.minSelection, 10),
        maxSelection: parseInt(groupeForm.maxSelection, 10),
      };

      await adminApi.creerGroupeOption(produit.id, payload);
      setGroupeForm({ nom: '', minSelection: 1, maxSelection: 1 });
      await chargerGroupes();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Erreur création groupe d'option :", err);
      alert("Erreur lors de la création du groupe.");
    }
  };

  // --- GESTION EDITION INLINE GROUPE ---
  const handleStartEditGroupe = (grp) => {
    setEditingGroupeId(grp.id);
    setEditGroupeForm({
      nom: grp.nom,
      minSelection: grp.minSelection,
      maxSelection: grp.maxSelection,
    });
  };

  const handleSaveInlineGroupe = async (idGroupe) => {
    try {
      const payload = {
        nom: editGroupeForm.nom,
        minSelection: parseInt(editGroupeForm.minSelection, 10),
        maxSelection: parseInt(editGroupeForm.maxSelection, 10),
      };

      await adminApi.modifierGroupeOption(idGroupe, payload);
      setEditingGroupeId(null);
      await chargerGroupes();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Erreur modification groupe :", err);
      alert("Erreur lors de la modification du groupe.");
    }
  };

  const handleSupprimerGroupe = async (idGroupe, nom) => {
    if (window.confirm(`Supprimer le groupe "${nom}" et toutes ses options ?`)) {
      try {
        await adminApi.supprimerGroupeOption(idGroupe);
        await chargerGroupes();
        if (onRefresh) onRefresh();
      } catch (err) {
        console.error("Erreur suppression groupe :", err);
        alert("Erreur lors de la suppression du groupe.");
      }
    }
  };

  // --- GESTION ITEMS ---
  const handleMatiereChange = (e) => {
    const idMat = e.target.value;
    const matTrouvee = matieresPremieres.find((m) => m.id === parseInt(idMat, 10));
    setItemForm({
      ...itemForm,
      idMatiere: idMat,
      nom: matTrouvee ? matTrouvee.nom : itemForm.nom,
    });
  };

  const handleAjouterItem = async (e, idGroupe) => {
    e.preventDefault();
    if (!itemForm.idMatiere || !itemForm.nom) return;

    try {
      const payload = {
        groupeId: parseInt(idGroupe, 10),
        nom: itemForm.nom,
        surcout: parseFloat(itemForm.surcout || 0),
        matierePremiereId: parseInt(itemForm.idMatiere, 10),
        quantiteDeduite: parseFloat(itemForm.quantiteDeduite || 1),
      };

      await adminApi.creerOptionItem(idGroupe, payload);
      setItemForm({ nom: '', idMatiere: '', quantiteDeduite: '1', surcout: '0' });
      setActiveGroupeId(null);
      await chargerGroupes();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Erreur ajout option :", err);
      alert("Erreur lors de l'ajout de l'option.");
    }
  };

  const handleSupprimerItem = async (idItem) => {
    try {
      await adminApi.supprimerOptionItem(idItem);
      await chargerGroupes();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Erreur suppression option :", err);
      alert("Erreur lors de la suppression de l'option.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              Gérer les Options — <span className="text-red-600">{produit.nom}</span>
            </h3>
            <p className="text-xs text-gray-500">
              Créez des groupes d'options (ex: Choix de la Viande, Sauces) et définissez les règles de sélection.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold px-2"
          >
            ✕
          </button>
        </div>

        {loading && <p className="text-gray-500 text-sm">Chargement des options...</p>}
        {erreur && <p className="text-red-500 text-sm">{erreur}</p>}

        {!loading && !erreur && (
          <div className="space-y-6">
            {/* FORMULAIRE SEULEMENT POUR CREATION GROUPE */}
            <form onSubmit={handleCreerGroupe} className="bg-gray-50 p-4 rounded-lg border space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                + Nouveau groupe d'options
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nom du groupe</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Choix de la Viande"
                    value={groupeForm.nom}
                    onChange={(e) => setGroupeForm({ ...groupeForm, nom: e.target.value })}
                    className="w-full border rounded px-3 py-1.5 text-xs bg-white focus:ring-1 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Sélection min. <span className="text-gray-400 font-normal">(0 = Optionnel)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={groupeForm.minSelection}
                    onChange={(e) => setGroupeForm({ ...groupeForm, minSelection: e.target.value })}
                    className="w-full border rounded px-3 py-1.5 text-xs bg-white focus:ring-1 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Sélection max.</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={groupeForm.maxSelection}
                    onChange={(e) => setGroupeForm({ ...groupeForm, maxSelection: e.target.value })}
                    className="w-full border rounded px-3 py-1.5 text-xs bg-white focus:ring-1 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold transition-colors"
                >
                  Créer le groupe
                </button>
              </div>
            </form>

            {/* LISTE DES GROUPES & OPTIONS ASSOCIÉES */}
            <div className="space-y-4">
              {groupes.length === 0 ? (
                <p className="text-center py-6 text-sm text-gray-400 bg-gray-50 rounded border border-dashed">
                  Aucun groupe d'options configuré pour ce produit.
                </p>
              ) : (
                groupes.map((grp) => {
                  const estObligatoire = grp.minSelection > 0;
                  const isEditing = editingGroupeId === grp.id;

                  return (
                    <div key={grp.id} className="border rounded-lg bg-white overflow-hidden shadow-sm">
                      {/* HEADER GROUPE */}
                      <div className="bg-gray-100 px-4 py-3 border-b">
                        {isEditing ? (
                          /* EN-TÊTE EN MODE ÉDITION INLINE */
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                              <input
                                type="text"
                                required
                                value={editGroupeForm.nom}
                                onChange={(e) => setEditGroupeForm({ ...editGroupeForm, nom: e.target.value })}
                                className="border rounded px-2 py-1 text-xs font-bold text-gray-800 bg-white"
                                placeholder="Nom du groupe"
                              />
                              <div className="flex items-center gap-1 text-xs">
                                <span className="text-gray-500 text-[10px]">Min:</span>
                                <input
                                  type="number"
                                  min="0"
                                  required
                                  value={editGroupeForm.minSelection}
                                  onChange={(e) => setEditGroupeForm({ ...editGroupeForm, minSelection: e.target.value })}
                                  className="w-16 border rounded px-1.5 py-1 text-xs bg-white"
                                />
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                <span className="text-gray-500 text-[10px]">Max:</span>
                                <input
                                  type="number"
                                  min="1"
                                  required
                                  value={editGroupeForm.maxSelection}
                                  onChange={(e) => setEditGroupeForm({ ...editGroupeForm, maxSelection: e.target.value })}
                                  className="w-16 border rounded px-1.5 py-1 text-xs bg-white"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => handleSaveInlineGroupe(grp.id)}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold"
                              >
                                Enregistrer
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingGroupeId(null)}
                                className="px-2 py-1 border text-xs rounded text-gray-600 bg-white hover:bg-gray-50"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* EN-TÊTE EN MODE AFFICHAGE */
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-gray-800 text-sm">{grp.nom}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  estObligatoire
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                }`}
                              >
                                {estObligatoire
                                  ? `Obligatoire (${grp.minSelection} min)`
                                  : 'Optionnel'}
                              </span>
                              <span className="text-xs text-gray-500">
                                Max : <strong className="text-gray-700">{grp.maxSelection}</strong>
                              </span>
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

                      {/* ITEMS DU GROUPE */}
                      <div className="p-4 space-y-3">
                        {(!grp.options || grp.options.length === 0) ? (
                          <p className="text-xs text-gray-400 italic">
                            Aucune option dans ce groupe. Ajoutez-en une ci-dessous.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {grp.options.map((opt) => (
                              <div
                                key={opt.id}
                                className="flex justify-between items-center border rounded px-3 py-2 bg-gray-50/60 hover:bg-gray-50 text-xs"
                              >
                                <div>
                                  <span className="font-semibold text-gray-800">{opt.nom}</span>
                                  <div className="text-[11px] text-gray-500">
                                    Déduction stock : {opt.quantiteDeduite}
                                    {opt.surcout > 0 && (
                                      <span className="ml-2 font-bold text-green-700">
                                        (+{Number(opt.surcout).toFixed(2)} €)
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleSupprimerItem(opt.id)}
                                  className="text-red-500 hover:text-red-700 font-bold px-1 text-sm"
                                  title="Supprimer cette option"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* BOUTON ET FORMULAIRE D'AJOUT D'OPTION */}
                        {activeGroupeId === grp.id ? (
                          <form
                            onSubmit={(e) => handleAjouterItem(e, grp.id)}
                            className="bg-red-50/50 border border-red-200 p-3 rounded-md space-y-2 mt-2"
                          >
                            <h5 className="text-[11px] font-bold text-red-800 uppercase">
                              Ajouter une option à "{grp.nom}"
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">
                                  Matière Première
                                </label>
                                <select
                                  required
                                  value={itemForm.idMatiere}
                                  onChange={handleMatiereChange}
                                  className="w-full border rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-red-500 outline-none"
                                >
                                  <option value="">-- Sélectionner --</option>
                                  {matieresPremieres.map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {m.nom}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">
                                  Qté déduite
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  required
                                  value={itemForm.quantiteDeduite}
                                  onChange={(e) =>
                                    setItemForm({ ...itemForm, quantiteDeduite: e.target.value })
                                  }
                                  className="w-full border rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-red-500 outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">
                                  Surcoût (€)
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={itemForm.surcout}
                                  onChange={(e) =>
                                    setItemForm({ ...itemForm, surcout: e.target.value })
                                  }
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
                                Enregistrer l'option
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveGroupeId(grp.id);
                              setItemForm({ nom: '', idMatiere: '', quantiteDeduite: '1', surcout: '0' });
                            }}
                            className="text-xs text-red-600 hover:text-red-700 font-semibold border border-red-200 hover:border-red-300 px-3 py-1 rounded bg-white transition-colors"
                          >
                            + Ajouter une option
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