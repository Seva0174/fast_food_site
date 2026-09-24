import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';

export function VuePersonnel() {
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  // Formulaire de création d'employé
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [mdp, setMdp] = useState('');
  const [roleSysteme, setRoleSysteme] = useState('employe');
  const [roleRH, setRoleRH] = useState('CUISINIER');
  const [salaireHeure, setSalaireHeure] = useState('');
  const [validationEmailErreur, setValidationEmailErreur] = useState('');

  // Mode Édition d'employé
  const [employeEnEdition, setEmployeEnEdition] = useState(null);
  const [editNom, setEditNom] = useState('');
  const [editRoleSysteme, setEditRoleSysteme] = useState('employe');
  const [editRoleRH, setEditRoleRH] = useState('CUISINIER');
  const [editSalaireHeure, setEditSalaireHeure] = useState('');

  // Saisie et Consultation des Heures
  const [employeSelectionne, setEmployeSelectionne] = useState(null);
  const [dateHeures, setDateHeures] = useState('');
  const [saisieHeures, setSaisieHeures] = useState('8');
  const [saisieMinutes, setSaisieMinutes] = useState('0');
  const [heuresListe, setHeuresListe] = useState([]);

  // Filtre par période
  const [dateDebutHeures, setDateDebutHeures] = useState('');
  const [dateFinHeures, setDateFinHeures] = useState('');

  // Fiche de Paie
  const [moisPaie, setMoisPaie] = useState(new Date().getMonth() + 1);
  const [anneePaie, setAnneePaie] = useState(new Date().getFullYear());
  const [fichePaie, setFichePaie] = useState(null);

  useEffect(() => {
    setFichePaie(null);
  }, [moisPaie, anneePaie, employeSelectionne]);

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

    if (!mdp) {
      alert("Le mot de passe est obligatoire pour la création de compte.");
      return;
    }

    adminApi.creerEmploye({
      nom,
      email,
      mdp,
      roleSysteme,
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
    const payload = {
      nom: editNom,
      email: emp.email,
      roleSysteme: editRoleSysteme,
      role: editRoleRH,
      salaireHeure: parseFloat(editSalaireHeure)
    };

    adminApi.modifierEmploye(emp.id, payload)
      .then(() => {
        setEmployeEnEdition(null);
        chargerEmployes();
      })
      .catch((err) => {
        console.error(err);
        alert("Erreur lors de la modification : " + (err.response?.data?.message || "Données invalides"));
      });
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
    setDateDebutHeures('');
    setDateFinHeures('');
    adminApi.getHeuresEmploye(emp.id)
      .then((res) => setHeuresListe(res.data))
      .catch(() => setHeuresListe([]));
  };

  const handleFiltrerHeuresParPeriode = (e) => {
    e.preventDefault();
    if (!employeSelectionne || !dateDebutHeures || !dateFinHeures) {
      alert("Veuillez sélectionner une date de début et une date de fin.");
      return;
    }

    adminApi.getHeuresEmployeParPeriode(employeSelectionne.id, dateDebutHeures, dateFinHeures)
      .then((res) => setHeuresListe(res.data))
      .catch(() => alert("Erreur lors de la récupération des heures pour cette période."));
  };

  const handleReinitialiserFiltreHeures = () => {
    setDateDebutHeures('');
    setDateFinHeures('');
    if (employeSelectionne) {
      adminApi.getHeuresEmploye(employeSelectionne.id)
        .then((res) => setHeuresListe(res.data));
    }
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

  const handleSupprimerSaisieHeure = (idHeure) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette saisie d'heures ?")) {
      adminApi.supprimerHeuresEmploye(idHeure)
        .then(() => {
          setHeuresListe((prev) => prev.filter((h) => h.id !== idHeure));
        })
        .catch(() => alert("Erreur lors de la suppression de l'heure."));
    }
  };

  const handleCalculerSalaire = (e) => {
    e.preventDefault();
    if (!employeSelectionne) return;

    adminApi.getSalaireMensuelEmploye(employeSelectionne.id, anneePaie, moisPaie)
      .then((res) => setFichePaie(res.data))
      .catch((err) => alert("Erreur calcul salaire : " + (err.response?.data?.message || err.message)));
  };

  const formatHeuresDecimales = (valeurDecimal) => {
    const totalMinutes = Math.round(valeurDecimal * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m > 0 ? `${h}h ${m < 10 ? '0' : ''}${m}min` : `${h}h`;
  };

  return (
    <div className="space-y-6">
      {/* Formulaire de création d'employé */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Embaucher un nouvel employé</h2>
        <form onSubmit={handleCreerEmploye} className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nom complet</label>
            <input
              type="text"
              placeholder="ex: Jean Dupont"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:ring-1 focus:ring-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email pro</label>
            <input
              type="email"
              placeholder="nom@tacoburger.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:ring-1 focus:ring-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Mot de passe</label>
            <input
              type="password"
              placeholder="Mot de passe"
              value={mdp}
              onChange={(e) => setMdp(e.target.value)}
              className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:ring-1 focus:ring-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Accès Système</label>
            <select
              value={roleSysteme}
              onChange={(e) => setRoleSysteme(e.target.value)}
              className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:ring-1 focus:ring-red-500"
            >
              <option value="employe">Employé</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Poste RH</label>
            <select
              value={roleRH}
              onChange={(e) => setRoleRH(e.target.value)}
              className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:ring-1 focus:ring-red-500"
            >
              <option value="CUISINIER">Cuisinier</option>
              <option value="CAISSIER">Caissier</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Taux (€/h)</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                placeholder="12.50"
                value={salaireHeure}
                onChange={(e) => setSalaireHeure(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-red-500"
                required
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
              >
                Créer
              </button>
            </div>
          </div>
        </form>
        {validationEmailErreur && (
          <p className="text-red-500 text-xs font-semibold mt-2">{validationEmailErreur}</p>
        )}
      </div>

      {/* Tableau des employés */}
      <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Liste des Salariés</h2>
        {loading && <p className="text-gray-500 text-sm">Chargement de l'équipe...</p>}
        {erreur && <p className="text-red-500 text-sm">{erreur}</p>}

        {!loading && !erreur && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600 uppercase text-xs">
                  <th className="p-3">Nom</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Rôle Système</th>
                  <th className="p-3">Poste RH</th>
                  <th className="p-3">Taux Horaire</th>
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

                      <td className="p-3 text-gray-600">{emp.email}</td>

                      <td className="p-3">
                        {estEnEdition ? (
                          <select
                            value={editRoleSysteme}
                            onChange={(e) => setEditRoleSysteme(e.target.value)}
                            className="border rounded px-2 py-1 text-sm"
                          >
                            <option value="employe">employe</option>
                            <option value="admin">admin</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded ${
                              emp.roleSysteme === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {emp.roleSysteme}
                          </span>
                        )}
                      </td>

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

                      <td className="p-3">
                        {estEnEdition ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.01"
                              value={editSalaireHeure}
                              onChange={(e) => setEditSalaireHeure(e.target.value)}
                              className="border rounded px-2 py-1 text-sm w-20"
                            />
                            <span>€/h</span>
                          </div>
                        ) : (
                          `${Number(emp.salaireHeure).toFixed(2)} € / h`
                        )}
                      </td>

                      <td className="p-3 text-right space-x-2">
                        {estEnEdition ? (
                          <div className="flex items-center justify-end gap-2">
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
                          </div>
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

      {/* Module Gestion des Heures & Salaires */}
      {employeSelectionne && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-lg font-bold text-gray-800">
                Heures travaillées — <span className="text-red-600">{employeSelectionne.nom}</span>
              </h3>
            </div>

            {/* Saisie d'heures */}
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

            {/* Sélection / Validation par Période */}
            <div className="pt-2 border-t space-y-2">
              <span className="text-xs font-semibold text-gray-500">Filtrer par période :</span>
              <form onSubmit={handleFiltrerHeuresParPeriode} className="flex flex-wrap gap-2 items-center">
                <input
                  type="date"
                  value={dateDebutHeures}
                  onChange={(e) => setDateDebutHeures(e.target.value)}
                  className="border rounded px-2 py-1 text-xs flex-1"
                  required
                />
                <span className="text-xs text-gray-400">à</span>
                <input
                  type="date"
                  value={dateFinHeures}
                  onChange={(e) => setDateFinHeures(e.target.value)}
                  className="border rounded px-2 py-1 text-xs flex-1"
                  required
                />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                >
                  Valider la période
                </button>
                {(dateDebutHeures || dateFinHeures) && (
                  <button
                    type="button"
                    onClick={handleReinitialiserFiltreHeures}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    Effacer
                  </button>
                )}
              </form>
            </div>

            {/* Liste des Saisies d'Heures */}
            <div className="max-h-48 overflow-y-auto border rounded divide-y text-sm">
              {heuresListe.length === 0 ? (
                <p className="p-3 text-gray-400 text-xs">Aucune heure trouvée pour cette sélection.</p>
              ) : (
                heuresListe.map((h) => (
                  <div key={h.id} className="p-2 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <span className="font-medium text-gray-800 mr-2">{h.date}</span>
                      <span className="text-gray-500 text-xs">
                        ({formatHeuresDecimales(h.nbHeure)})
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-700">{h.nbHeure}h</span>
                      <button
                        onClick={() => handleSupprimerSaisieHeure(h.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold px-1"
                        title="Supprimer la saisie"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Calcul du Salaire */}
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
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Total Heures (Mois) :</span>
                <span className="font-bold text-gray-800 text-base">
                  {fichePaie ? `${fichePaie.totalHeures} h` : '—'}
                </span>
              </div>

              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Taux Horaire :</span>
                <span className="font-semibold text-gray-800">
                  {fichePaie ? `${Number(fichePaie.salaireHeure || 0).toFixed(2)} € / h` : '—'}
                </span>
              </div>

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