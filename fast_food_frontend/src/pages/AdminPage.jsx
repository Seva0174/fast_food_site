import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { StatsGlobalesCards } from '../components/StatsGlobalesCards';
import { GraphiqueCommandesJour } from '../components/GraphiqueCommandesJour';
import { TopVentesTable } from '../components/TopVentesTable';

export function AdminPage() {
  const [ongletActif, setOngletActif] = useState('statistiques');

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête Navigation */}
        <div className="flex border-b border-gray-200 bg-white rounded-t-lg px-4 pt-3">
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
          {/* Tu peux ajouter tes autres onglets ici (ex: Commandes, Stock, Personnel...) */}
        </div>

        {/* Contenu principal */}
        {ongletActif === 'statistiques' && <VueStatistiques />}
      </div>
    </div>
  );
}

/* --- ONGLET STATISTIQUES --- */
function VueStatistiques() {
  const [stats, setStats] = useState(null);
  const [topProduits, setTopProduits] = useState([]);
  const [commandesParJour, setCommandesParJour] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  // Gestion de la période de filtre
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

      {/* Traitement des états de chargement et d'erreur */}
      {loading && <p className="text-gray-500">Chargement des statistiques...</p>}
      {erreur && <p className="text-red-500 font-medium">{erreur}</p>}

      {/* Sections modulaires */}
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

export default AdminPage;