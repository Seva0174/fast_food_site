// Classement des produits : rang, nom, barre proportionnelle au premier, quantité.
export function TopVentesTable({ topProduits, surPeriode }) {
  const maximum = Math.max(1, ...topProduits.map((item) => item.quantiteVendue));

  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <h3 className="titre-marque text-2xl">Top des ventes</h3>

      {topProduits.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {surPeriode ? 'Aucune vente sur cette période.' : 'Aucune vente pour le moment.'}
        </p>
      ) : (
        <table className="mt-3 w-full border-collapse text-left">
          <caption className="sr-only">Produits les plus vendus, par quantité</caption>
          <thead>
            <tr className="border-b border-border text-sm text-muted-foreground">
              <th scope="col" className="w-10 py-2 font-medium">
                <span className="sr-only">Rang</span>
              </th>
              <th scope="col" className="py-2 pr-4 font-medium">Produit</th>
              <th scope="col" className="whitespace-nowrap py-2 text-right font-medium">
                Quantité vendue
              </th>
            </tr>
          </thead>
          <tbody>
            {topProduits.map((item, index) => (
              <tr key={item.produitId} className="border-b border-border last:border-b-0">
                <td className="w-10 whitespace-nowrap py-3 pr-3 align-top font-semibold tabular-nums text-muted-foreground">
                  {index + 1}
                </td>
                <td className="w-full max-w-0 py-3 pr-4">
                  <p className="truncate" title={item.produitNom}>
                    {item.produitNom}
                  </p>
                  <div aria-hidden="true" className="mt-1.5 h-1.5 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-muted-foreground"
                      style={{ width: `${(item.quantiteVendue / maximum) * 100}%` }}
                    />
                  </div>
                </td>
                <td className="py-3 text-right align-top font-semibold tabular-nums">
                  {item.quantiteVendue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
