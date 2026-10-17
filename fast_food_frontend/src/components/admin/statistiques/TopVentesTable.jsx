export function TopVentesTable({ topProduits }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800">Top des Ventes</h3>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-2">Produit</th>
            <th className="p-2">Quantité vendue</th>
          </tr>
        </thead>
        <tbody>
          {topProduits.map((item) => (
            <tr key={item.produitId} className="border-b hover:bg-gray-50">
              <td className="p-2">{item.produitNom}</td>
              <td className="p-2 font-semibold">{item.quantiteVendue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}