import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { StatsGlobalesCards } from '../components/StatsGlobalesCards';
import { GraphiqueCommandesJour } from '../components/GraphiqueCommandesJour';
import { TopVentesTable } from '../components/TopVentesTable';
import { VueCarteAdmin } from '../components/VueCarteAdmin';

export function AdminPage() {
  const [ongletActif, setOngletActif] = useState('statistiques');
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation par onglets */}
        <div className="flex border-b border-gray-200 bg-white rounded-t-lg px-4 pt-3 gap-2">
          <button
            onClick={() => setOngletActif('statistiques')}
            className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
              ongletActif === 'statistiques'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Statistiques
          </button>
          <button
            onClick={() => setOngletActif('carte')}
            className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
              ongletActif === 'carte'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Carte & Produits
          </button>
          <button
            onClick={() => setOngletActif('commandes')}
            className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
              ongletActif === 'commandes'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Commandes
          </button>
          <button
            onClick={() => setOngletActif('stock')}
            className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
              ongletActif === 'stock'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Stock
          </button>
          <button
            onClick={() => setOngletActif('personnel')}
            className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
              ongletActif === 'personnel'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Personnel
          </button>
        </div>

        {/* Affichage conditionnel des vues */}
        {ongletActif === 'statistiques' && <VueStatistiques />}
        {ongletActif === 'carte' &&  <VueCarteAdmin/>}
        {ongletActif === 'commandes' && <VueCommandes />}
        {ongletActif === 'stock' && <VueStock />}
        {ongletActif === 'personnel' && <VuePersonnel />}
      </div>
    </div>
  );
}

/* --- 1. ONGLET STATISTIQUES --- */
function VueStatistiques() {
  const [stats, setStats] = useState(null);
  const [topProduits, setTopProduits] = useState([]);
  const [commandesParJour, setCommandesParJour] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  const [modePeriode, setModePeriode] = useState('global');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  const chargerStats = (debut, fin) => {
    setLoading(true);
    setErreur(null);

    const promiseStats = (debut && fin)
      ? adminApi.getStatsParPeriode(debut, fin)
      : adminApi.getStatsGlobales();

    Promise.all([
      promiseStats,
      adminApi.getVentesProduits(),
      adminApi.getCommandesParJour()
    ])
      .then(([resStats, resTop, resJours]) => {
        setStats(resStats.data);
        setTopProduits(resTop.data);
        setCommandesParJour(resJours.data);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération des statistiques :", err);
        setErreur("Erreur lors de la récupération des données.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    chargerStats();
  }, []);

  const handleChangerMode = (mode) => {
    setModePeriode(mode);
    if (mode === 'global') {
      setDateDebut('');
      setDateFin('');
      chargerStats();
    }
  };

  const handleFiltrerCustom = (e) => {
    e.preventDefault();
    if (dateDebut && dateFin) {
      chargerStats(dateDebut, dateFin);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barre de filtres de dates */}
      <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => handleChangerMode('global')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              modePeriode === 'global'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Vue globale
          </button>
          <button
            onClick={() => handleChangerMode('custom')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              modePeriode === 'custom'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Période personnalisée
          </button>
        </div>

        {modePeriode === 'custom' && (
          <form onSubmit={handleFiltrerCustom} className="flex items-center gap-3">
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
              required
            />
            <span className="text-gray-500 text-sm">au</span>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
              required
            />
            <button
              type="submit"
              className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-900 transition-colors"
            >
              Filtrer
            </button>
          </form>
        )}
      </div>

      {loading && <p className="text-gray-500">Chargement des statistiques...</p>}
      {erreur && <p className="text-red-500 font-medium">{erreur}</p>}

      {!loading && !erreur && (
        <>
          <StatsGlobalesCards stats={stats} />
          <GraphiqueCommandesJour data={commandesParJour} />
          <TopVentesTable topProduits={topProduits} />
        </>
      )}
    </div>
  );
}

/* --- 2. ONGLET COMMANDES --- */
function VueCommandes() {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Gestion des Commandes</h2>
      <p className="text-gray-600">Historique et gestion des commandes en cours.</p>
      {/* Insère ici la logique / tableau de tes commandes */}
    </div>
  );
}

/* --- 3. ONGLET STOCK --- */
function VueStock() {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Gestion du Stock</h2>
      <p className="text-gray-600">Suivi des ingrédients, approvisionnements et alertes de stock.</p>
      {/* Insère ici la logique / tableau de ton stock */}
    </div>
  );
}

/* --- 4. ONGLET PERSONNEL --- */
function VuePersonnel() {
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  // Formulaire de création d'employé + compte
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [mdp, setMdp] = useState('');
  const [roleSysteme, setRoleSysteme] = useState('employe'); // admin, employe, client
  const [roleRH, setRoleRH] = useState('CUISINIER');
  const [salaireHeure, setSalaireHeure] = useState('');
  const [validationEmailErreur, setValidationEmailErreur] = useState('');

  // Mode Édition d'employé
  const [employeEnEdition, setEmployeEnEdition] = useState(null);
  const [editNom, setEditNom] = useState('');
  const [editRoleSysteme, setEditRoleSysteme] = useState('employe');
  const [editRoleRH, setEditRoleRH] = useState('CUISINIER');
  const [editSalaireHeure, setEditSalaireHeure] = useState('');

  // Saisie des Heures
  const [employeSelectionne, setEmployeSelectionne] = useState(null);
  const [dateHeures, setDateHeures] = useState('');
  const [saisieHeures, setSaisieHeures] = useState('8');
  const [saisieMinutes, setSaisieMinutes] = useState('0');
  const [heuresListe, setHeuresListe] = useState([]);

  // Fiche de Paie
  const [moisPaie, setMoisPaie] = useState(new Date().getMonth() + 1);
  const [anneePaie, setAnneePaie] = useState(new Date().getFullYear());
  const [fichePaie, setFichePaie] = useState(null);

  const heuresDuMois = heuresListe.filter((h) => {
    if (!h.date) return false;
    const [annee, mois] = h.date.split('-').map(Number);
    return annee === Number(anneePaie) && mois === Number(moisPaie);
  });

  const totalHeuresDuMois = heuresDuMois.reduce((acc, curr) => acc + (curr.nbHeure || 0), 0);

  // Reset du salaire calculé si le mois, l'année ou l'employé change
  useEffect(() => {
    setFichePaie(null);
  }, [moisPaie, anneePaie, employeSelectionne]);

  // 2. Appel du backend Spring Boot UNIQUEMENT au clic sur "Calculer"
  const handleCalculerSalaire = (e) => {
    e.preventDefault();
    if (!employeSelectionne) return;

    adminApi.getSalaireMensuelEmploye(employeSelectionne.id, anneePaie, moisPaie)
      .then((res) => setFichePaie(res.data))
      .catch((err) => alert("Erreur calcul salaire : " + (err.response?.data?.message || err.message)));
  };

  const chargerEmployes = () => {
    setLoading(true);
    adminApi.getEmployes()
      .then((res) => setEmployes(res.data))
      .catch(() => setErreur("Erreur lors du chargement des employés."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    chargerEmployes();
  }, []);

  const handleCreerEmploye = (e) => {
    e.preventDefault();
    setValidationEmailErreur('');

    if (!email.toLowerCase().endsWith('@tacoburger.fr')) {
      setValidationEmailErreur("L'adresse email doit impérativement se terminer par @tacoburger.fr");
      return;
    }

    adminApi.creerEmploye({
      nom,
      email,
      mdp: mdp || 'FastFood2026!',
      roleSysteme, // "admin", "employe", ou "client"
      role: roleRH,
      salaireHeure: parseFloat(salaireHeure)
    })
      .then(() => {
        setNom('');
        setEmail('');
        setMdp('');
        setSalaireHeure('');
        setRoleSysteme('employe');
        chargerEmployes();
      })
      .catch((err) => alert("Erreur lors de la création : " + (err.response?.data?.message || err.message)));
  };

  const handleDemarrerEdition = (emp) => {
    setEmployeEnEdition(emp.id);
    setEditNom(emp.nom);
    setEditRoleSysteme(emp.roleSysteme || 'employe');
    setEditRoleRH(emp.role || 'CUISINIER');
    setEditSalaireHeure(emp.salaireHeure);
  };

  const handleSauvegarderEdition = (emp) => {
    adminApi.modifierEmploye(emp.id, {
      nom: editNom,
      email: emp.email, // L'email ne change pas
      roleSysteme: editRoleSysteme,
      role: editRoleRH,
      salaireHeure: parseFloat(editSalaireHeure)
    })
      .then(() => {
        setEmployeEnEdition(null);
        chargerEmployes();
      })
      .catch(() => alert("Erreur lors de la modification de l'employé."));
  };

  const handleSupprimerEmploye = (id) => {
    if (window.confirm("Supprimer cet employé supprimera également son compte utilisateur. Confirmer ?")) {
      adminApi.supprimerEmploye(id)
        .then(() => {
          if (employeSelectionne?.id === id) setEmployeSelectionne(null);
          chargerEmployes();
        })
        .catch(() => alert("Erreur lors de la suppression."));
    }
  };

  const handleSelectEmploye = (emp) => {
    setEmployeSelectionne(emp);
    setFichePaie(null);
    adminApi.getHeuresEmploye(emp.id)
      .then((res) => setHeuresListe(res.data))
      .catch(() => setHeuresListe([]));
  };

  const handleAjouterHeures = (e) => {
    e.preventDefault();
    if (!employeSelectionne) return;

    const totalDecimal = (parseInt(saisieHeures, 10) || 0) + ((parseInt(saisieMinutes, 10) || 0) / 60);

    if (totalDecimal <= 0 || totalDecimal > 24) {
      alert("Le nombre d'heures par jour doit être entre 0 et 24h.");
      return;
    }

    adminApi.ajouterHeuresEmploye({
      employeId: employeSelectionne.id,
      date: dateHeures,
      nbHeure: parseFloat(totalDecimal.toFixed(4))
    })
      .then(() => {
        setDateHeures('');
        setSaisieHeures('8');
        setSaisieMinutes('0');
        return adminApi.getHeuresEmploye(employeSelectionne.id);
      })
      .then((res) => setHeuresListe(res.data))
      .catch((err) => alert("Erreur : " + (err.response?.data?.message || "Erreur de saisie")));
  };

  const formatHeuresDecimales = (valeurDecimal) => {
    const totalMinutes = Math.round(valeurDecimal * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m > 0 ? `${h}h ${m < 10 ? '0' : ''}${m}min` : `${h}h`;
  };

  return (
    <div className="space-y-6">
      {/* 1. Formulaire de création d'employé */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Embaucher un nouvel employé</h2>
        <form onSubmit={handleCreerEmploye} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nom complet</label>
            <input
              type="text"
              placeholder="ex: Jean Dupont"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email professionnel</label>
            <input
              type="email"
              placeholder="nom@tacoburger.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Rôle / Poste</label>
            <select
              value={roleRH}
              onChange={(e) => setRoleRH(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-red-500"
            >
              <option value="CUISINIER">Cuisinier</option>
              <option value="CAISSIER">Caissier</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Taux horaire (€/h)</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                placeholder="12.50"
                value={salaireHeure}
                onChange={(e) => setSalaireHeure(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-red-500"
                required
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Ajouter
              </button>
            </div>
          </div>
        </form>
        {validationEmailErreur && (
          <p className="text-red-500 text-xs font-semibold mt-2">{validationEmailErreur}</p>
        )}
      </div>

      {/* 2. Tableau du personnel avec édition du salaire */}
      <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Liste des Salariés</h2>
        {loading && <p className="text-gray-500 text-sm">Chargement de l'équipe...</p>}
        {erreur && <p className="text-red-500 text-sm">{erreur}</p>}

        {!loading && !erreur && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600 uppercase text-xs">
                  <th className="p-3">ID</th>
                  <th className="p-3">Nom</th>
                  <th className="p-3">Poste</th>
                  <th className="p-3">Salaire Horaire</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {employes.map((emp) => {
                  const estEnEdition = employeEnEdition === emp.id;
                  return (
                    <tr
                      key={emp.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        employeSelectionne?.id === emp.id ? 'bg-red-50 font-medium' : ''
                      }`}
                    >
                      <td className="p-3">{emp.id}</td>

                      {/* Nom */}
                      <td className="p-3">
                        {estEnEdition ? (
                          <input
                            type="text"
                            value={editNom}
                            onChange={(e) => setEditNom(e.target.value)}
                            className="border rounded px-2 py-1 text-sm w-full"
                          />
                        ) : (
                          emp.nom
                        )}
                      </td>

                      {/* Poste */}
                      <td className="p-3">
                        {estEnEdition ? (
                          <select
                            value={editRoleRH}
                            onChange={(e) => setEditRoleRH(e.target.value)}
                            className="border rounded px-2 py-1 text-sm"
                          >
                            <option value="CUISINIER">Cuisinier</option>
                            <option value="CAISSIER">Caissier</option>
                            <option value="MANAGER">Manager</option>
                          </select>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 border text-xs rounded-full">
                            {emp.role}
                          </span>
                        )}
                      </td>

                      {/* Salaire Horaire */}
                      <td className="p-3">
                        {estEnEdition ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.01"
                              value={editSalaireHeure}
                              onChange={(e) => setEditSalaireHeure(e.target.value)}
                              className="border rounded px-2 py-1 text-sm w-24"
                            />
                            <span>€ / h</span>
                          </div>
                        ) : (
                          `${Number(emp.salaireHeure).toFixed(2)} € / h`
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right space-x-2">
                        {estEnEdition ? (
                          <>
                            <button
                              onClick={() => handleSauvegarderEdition(emp)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                            >
                              Enregistrer
                            </button>
                            <button
                              onClick={() => setEmployeEnEdition(null)}
                              className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-xs"
                            >
                              Annuler
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleDemarrerEdition(emp)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleSelectEmploye(emp)}
                              className="bg-gray-800 hover:bg-gray-900 text-white px-3 py-1 rounded text-xs"
                            >
                              Gérer Heures
                            </button>
                            <button
                              onClick={() => handleSupprimerEmploye(emp.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                            >
                              Licencier
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Module Gestion des Heures & Salaires en 2 fenêtres séparées */}
      {employeSelectionne && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fenêtre Gauche : Saisie & Historique des Heures */}
          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-lg font-bold text-gray-800">
                Heures travaillées — <span className="text-red-600">{employeSelectionne.nom}</span>
              </h3>
            </div>

            <form onSubmit={handleAjouterHeures} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date</label>
                <input
                  type="date"
                  value={dateHeures}
                  onChange={(e) => setDateHeures(e.target.value)}
                  className="w-full border rounded px-2 py-1.5 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Heures (0 à 24)</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={saisieHeures}
                    onChange={(e) => setSaisieHeures(e.target.value)}
                    className="w-full border rounded px-2 py-1.5 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Minutes (0 à 59)</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    step="5"
                    value={saisieMinutes}
                    onChange={(e) => setSaisieMinutes(e.target.value)}
                    className="w-full border rounded px-2 py-1.5 text-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 rounded text-sm font-medium transition-colors"
              >
                Valider la saisie
              </button>
            </form>

            <div className="max-h-48 overflow-y-auto border rounded divide-y text-sm">
              {heuresListe.length === 0 ? (
                <p className="p-3 text-gray-400 text-xs">Aucune heure saisie pour le moment.</p>
              ) : (
                heuresListe.map((h) => (
                  <div key={h.id} className="p-2 flex justify-between items-center hover:bg-gray-50">
                    <span>{h.date}</span>
                    <span className="font-semibold text-gray-700">
                      {formatHeuresDecimales(h.nbHeure)} ({h.nbHeure}h)
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Fenêtre Droite : Calcul du Salaire Mensuel */}
          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Calcul du Salaire Mensuel</h3>

            <form onSubmit={handleCalculerSalaire} className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Mois</label>
                <select
                  value={moisPaie}
                  onChange={(e) => setMoisPaie(parseInt(e.target.value, 10))}
                  className="w-full border rounded px-2 py-1.5 text-sm"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('fr-FR', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Année</label>
                <input
                  type="number"
                  value={anneePaie}
                  onChange={(e) => setAnneePaie(parseInt(e.target.value, 10))}
                  className="w-full border rounded px-2 py-1.5 text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
              >
                Calculer
              </button>
            </form>

            <div className="bg-gray-50 p-4 rounded border space-y-3 text-sm">
              {/* Mise à jour instantanée du total des heures lors du changement de mois/année */}
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Total Heures :</span>
                <span className="font-bold text-gray-800 text-base">
                  {formatHeuresDecimales(totalHeuresDuMois)} ({totalHeuresDuMois} h)
                </span>
              </div>

              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Taux Horaire :</span>
                <span className="font-semibold text-gray-800">
                  {Number(employeSelectionne.salaireHeure || 0).toFixed(2)} € / h
                </span>
              </div>

              {/* Salaire affiché uniquement APRÈS clic sur "Calculer" */}
              <div className="flex justify-between items-center text-base font-bold text-red-600 pt-1">
                <span>Salaire Total Estimé :</span>
                <span className="text-xl">
                  {fichePaie
                    ? `${Number(fichePaie.salaireTotalEstime || 0).toFixed(2)} €`
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;