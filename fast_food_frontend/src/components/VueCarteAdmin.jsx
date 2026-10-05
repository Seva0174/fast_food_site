import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { GestionOptionsModal } from './GestionOptionsModal';

export function VueCarteAdmin() {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [matieresPremieres, setMatieresPremieres] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  // État du modal de création/édition de produit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produitEnEdition, setProduitEnEdition] = useState(null);

  // État du modal de gestion des options
  const [produitPourOptions, setProduitPourOptions] = useState(null);

  // Formulaire
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    imageUrl: '',
    idCategorie: '',
    estDispo: true,
  });

  const [recetteSelectionnee, setRecetteSelectionnee] = useState([]);
  const [ingrediantForm, setIngrediantForm] = useState({
    idMatiere: '',
    quantiteRequise: '1',
  });

  const chargerDonnees = async () => {
    setLoading(true);
    setErreur(null);
    try {
      const [resProd, resCat, resMat] = await Promise.all([
        adminApi.getProduits(),
        adminApi.getCategories(),
        adminApi.getMatieresPremieres(),
      ]);
      setProduits(resProd.data);
      setCategories(resCat.data);
      setMatieresPremieres(resMat.data);
    } catch (err) {
      console.error("Erreur lors de la récupération de la carte :", err);
      setErreur("Impossible de charger la carte.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  const handleOuvrirModal = (produit = null) => {
    if (produit) {
      setProduitEnEdition(produit);
      setFormData({
        nom: produit.nom || '',
        description: produit.description || '',
        prix: produit.prix || '',
        imageUrl: produit.imageUrl || '',
        idCategorie: produit.categorie?.id || (categories[0]?.id || ''),
        estDispo: produit.estDispo ?? true,
      });

      if (produit.recette && Array.isArray(produit.recette)) {
        setRecetteSelectionnee(
          produit.recette.map((item) => ({
            idMatiere: item.idMatiere,
            nomMatiere: item.nomMatiere,
            quantiteRequise: item.quantiteRequise,
          }))
        );
      } else {
        setRecetteSelectionnee([]);
      }
    } else {
      setProduitEnEdition(null);
      setFormData({
        nom: '',
        description: '',
        prix: '',
        imageUrl: '',
        idCategorie: categories[0]?.id || '',
        estDispo: true,
      });
      setRecetteSelectionnee([]);
    }
    setIngrediantForm({ idMatiere: '', quantiteRequise: '1' });
    setIsModalOpen(true);
  };

  const handleFermerModal = () => {
    setIsModalOpen(false);
    setProduitEnEdition(null);
  };

  const handleAjouterIngrediant = () => {
    if (!ingrediantForm.idMatiere || !ingrediantForm.quantiteRequise) return;

    const matId = parseInt(ingrediantForm.idMatiere, 10);
    const qte = parseFloat(ingrediantForm.quantiteRequise);

    const matiereTrouvee = Array.isArray(matieresPremieres)
      ? matieresPremieres.find((m) => m.id === matId)
      : null;

    if (!matiereTrouvee) return;

    const existeDeja = recetteSelectionnee.some((item) => item.idMatiere === matId);

    if (existeDeja) {
      setRecetteSelectionnee(
        recetteSelectionnee.map((item) =>
          item.idMatiere === matId
            ? { ...item, quantiteRequise: item.quantiteRequise + qte }
            : item
        )
      );
    } else {
      setRecetteSelectionnee([
        ...recetteSelectionnee,
        {
          idMatiere: matId,
          nomMatiere: matiereTrouvee.nom,
          quantiteRequise: qte,
        },
      ]);
    }

    setIngrediantForm({ idMatiere: '', quantiteRequise: '1' });
  };

  const handleSupprimerIngrediant = (idMatiere) => {
    setRecetteSelectionnee(
      recetteSelectionnee.filter((item) => item.idMatiere !== idMatiere)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        prix: parseFloat(formData.prix),
        idCategorie: parseInt(formData.idCategorie, 10),
        recette: recetteSelectionnee.map((item) => ({
          idMatiere: item.idMatiere,
          quantiteRequise: item.quantiteRequise,
        })),
      };

      if (produitEnEdition) {
        await adminApi.modifierProduit(produitEnEdition.id, payload);
      } else {
        await adminApi.creerProduit(payload);
      }

      handleFermerModal();
      chargerDonnees();
    } catch (err) {
      console.error("Erreur enregistrement produit :", err);
      alert("Erreur lors de l'enregistrement du produit.");
    }
  };

  const handleToggleDispo = async (id) => {
    try {
      await adminApi.toggleDisponibilite(id);
      setProduits((prev) =>
        prev.map((p) => (p.id === id ? { ...p, estDispo: !p.estDispo } : p))
      );
    } catch (err) {
      console.error("Erreur changement disponibilité :", err);
      alert("Erreur lors du changement de disponibilité.");
    }
  };

  const handleSupprimer = async (id, nom) => {
    if (window.confirm(`Voulez-vous vraiment supprimer le produit "${nom}" ?`)) {
      try {
        await adminApi.supprimerProduit(id);
        setProduits((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        console.error("Erreur suppression produit :", err);
        alert("Impossible de supprimer le produit (déjà présent dans des commandes ?).");
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gestion de la Carte</h2>
          <p className="text-gray-500 text-sm">
            Ajoutez, modifiez, désactivez les produits ou configurez leurs options (viandes, sauces, etc.).
          </p>
        </div>
        <button
          onClick={() => handleOuvrirModal()}
          className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded shadow transition-colors text-sm"
        >
          + Ajouter un produit
        </button>
      </div>

      {loading && <p className="text-gray-500">Chargement de la carte...</p>}
      {erreur && <p className="text-red-500 font-medium">{erreur}</p>}

      {!loading && !erreur && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600 font-semibold">
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Nom</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Prix</th>
                <th className="py-3 px-4">Disponibilité</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => {
                const produitsDeLaCat = produits.filter(
                  (p) => (p.categorie?.id || p.idCategorie) === cat.id
                );

                if (produitsDeLaCat.length === 0) return null;

                return (
                  <React.Fragment key={cat.id}>
                    <tr className="bg-gray-100/80 font-bold text-gray-700">
                      <td colSpan="6" className="py-2 px-4 uppercase text-xs tracking-wider">
                        {cat.nom}
                      </td>
                    </tr>

                    {produitsDeLaCat.map((prod) => (
                      <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4">
                          {prod.imageUrl ? (
                            <img
                              src={prod.imageUrl}
                              alt={prod.nom}
                              className="w-12 h-12 object-cover rounded border"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-gray-400"
                            style={{ display: prod.imageUrl ? 'none' : 'flex' }}
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
                            </svg>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {prod.nom}
                          {prod.description && (
                            <p className="text-xs text-gray-400 font-normal line-clamp-1">
                              {prod.description}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{cat.nom}</td>
                        <td className="py-3 px-4 font-semibold text-gray-800">
                          {Number(prod.prix).toFixed(2)} €
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleDispo(prod.id)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                              prod.estDispo
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            {prod.estDispo ? 'Disponible' : 'Rupture'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => setProduitPourOptions(prod)}
                            className="text-purple-600 hover:text-purple-800 font-medium text-xs border border-purple-200 hover:border-purple-400 px-2.5 py-1 rounded transition-colors"
                          >
                            Options
                          </button>
                          <button
                            onClick={() => handleOuvrirModal(prod)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 hover:border-blue-400 px-2.5 py-1 rounded transition-colors"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleSupprimer(prod.id, prod.nom)}
                            className="text-red-600 hover:text-red-800 font-medium text-xs border border-red-200 hover:border-red-400 px-2.5 py-1 rounded transition-colors"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL GESTION DES OPTIONS */}
      {produitPourOptions && (
        <GestionOptionsModal
          produit={produitPourOptions}
          matieresPremieres={matieresPremieres}
          onClose={() => setProduitPourOptions(null)}
          onRefresh={chargerDonnees}
        />
      )}

      {/* MODAL CRÉATION / ÉDITION PRODUIT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
              {produitEnEdition ? 'Modifier le produit' : 'Nouveau produit'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* COLONNE 1 : Informations Générales */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Détails du produit
                  </h4>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nom</label>
                    <input
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-red-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Catégorie</label>
                    <select
                      required
                      value={formData.idCategorie}
                      onChange={(e) => setFormData({ ...formData, idCategorie: e.target.value })}
                      className="w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-red-500 outline-none bg-white"
                    >
                      <option value="" disabled>Sélectionner une catégorie</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Prix (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={formData.prix}
                        onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                        className="w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={formData.estDispo}
                          onChange={(e) => setFormData({ ...formData, estDispo: e.target.checked })}
                          className="rounded text-red-500 focus:ring-red-500"
                        />
                        Disponible
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">URL de l'image</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-red-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-red-500 outline-none"
                    />
                  </div>
                </div>

                {/* COLONNE 2 : Composition / Recette */}
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg border">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Composition (Recette)
                    </h4>
                    <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                      {recetteSelectionnee.length} ingrédient(s)
                    </span>
                  </div>

                  {/* Choix et Ajout d'Ingrédients */}
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Ingrédient du stock</label>
                      <select
                        value={ingrediantForm.idMatiere}
                        onChange={(e) => setIngrediantForm({ ...ingrediantForm, idMatiere: e.target.value })}
                        className="w-full border rounded px-2.5 py-1.5 text-xs bg-white focus:ring-1 focus:ring-red-500 outline-none"
                      >
                        <option value="">-- Sélectionner une matière première --</option>
                        {Array.isArray(matieresPremieres) && matieresPremieres.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nom}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Quantité requise</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={ingrediantForm.quantiteRequise}
                          onChange={(e) => setIngrediantForm({ ...ingrediantForm, quantiteRequise: e.target.value })}
                          className="w-full border rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-red-500 outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAjouterIngrediant}
                        className="mt-5 bg-red-500 hover:bg-red-600 text-white font-semibold text-xs px-3 py-1.5 rounded transition-colors"
                      >
                        + Ajouter
                      </button>
                    </div>
                  </div>

                  {/* Liste des ingrédients ajoutés */}
                  <div className="border rounded bg-white mt-3 overflow-hidden">
                    {recetteSelectionnee.length === 0 ? (
                      <p className="text-center py-6 text-xs text-gray-400">
                        Aucun ingrédient associé à ce produit.
                      </p>
                    ) : (
                      <ul className="divide-y text-xs">
                        {recetteSelectionnee.map((item) => (
                          <li key={item.idMatiere} className="flex justify-between items-center px-3 py-2 hover:bg-gray-50">
                            <div>
                              <span className="font-semibold text-gray-800">{item.nomMatiere}</span>
                              <span className="text-gray-500 ml-2">x {item.quantiteRequise}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSupprimerIngrediant(item.idMatiere)}
                              className="text-red-500 hover:text-red-700 font-bold px-1"
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

              </div>

              <div className="flex justify-end gap-3 border-t pt-3">
                <button
                  type="button"
                  onClick={handleFermerModal}
                  className="px-4 py-2 border rounded text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}