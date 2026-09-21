import React from 'react';

export function StatsGlobalesCards({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-600 font-medium">Chiffre d'Affaires</p>
        <p className="text-2xl font-bold text-blue-900">{stats.chiffreAffairesTotal || 0} €</p>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-600 font-medium">Panier Moyen</p>
        <p className="text-2xl font-bold text-amber-900">{stats.panierMoyen || 0} €</p>
      </div>

      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600 font-medium">Dépenses Approvisionnement</p>
        <p className="text-2xl font-bold text-red-900">{stats.depensesApprovisionnement || 0} €</p>
      </div>

      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-600 font-medium">Masse Salariale</p>
        <p className="text-2xl font-bold text-green-900">{stats.masseSalariale || 0} €</p>
      </div>

      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-sm text-purple-600 font-medium">Commandes Valides</p>
        <p className="text-2xl font-bold text-purple-900">{stats.nombreCommandesTotal || 0}</p>
      </div>
    </div>
  );
}