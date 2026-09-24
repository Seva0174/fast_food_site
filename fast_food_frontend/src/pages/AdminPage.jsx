import React, { useState } from 'react';
import { VueStatistiques } from '../components/VueStatistiques';
import { VueCarteAdmin } from '../components/VueCarteAdmin';
import { VueCommandesAdmin } from '../components/VueCommandesAdmin';
import { VueStockAdmin } from '../components/VueStockAdmin';
import { VuePersonnel } from '../components/VuePersonnel';

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
            Stock & Fournisseurs
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

        {/* Rendu des vues isolées */}
        {ongletActif === 'statistiques' && <VueStatistiques />}
        {ongletActif === 'carte' && <VueCarteAdmin />}
        {ongletActif === 'commandes' && <VueCommandesAdmin />}
        {ongletActif === 'stock' && <VueStockAdmin />}
        {ongletActif === 'personnel' && <VuePersonnel />}
      </div>
    </div>
  );
}

export default AdminPage;