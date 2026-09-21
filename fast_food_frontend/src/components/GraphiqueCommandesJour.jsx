import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function GraphiqueCommandesJour({ data }) {
  return (
    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Commandes par jour de la semaine</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="jour" />
            <YAxis allowDecimals={false} />
            <Tooltip
              formatter={(value) => [`${value} commande(s)`, 'Total']}
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Bar dataKey="nombreCommandes" fill="#ef4444" radius={[6, 6, 0, 0]} name="Commandes" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}