import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  descriptionCommandesParJour,
  jourLePlusCharge,
  joursSansCommande,
  libelleNombreCommandes,
} from '@/lib/statistiques';

// Trois lettres par jour : les sept jours restent affichés sur mobile.
const abreger = (jour) => jour.slice(0, 3);

const styleInfobulle = {
  backgroundColor: 'var(--popover)',
  color: 'var(--popover-foreground)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
};

// surPeriode : false en vue globale (le message vide ne parle alors pas de « période »).
export function GraphiqueCommandesJour({ data, surPeriode }) {
  const pic = jourLePlusCharge(data);
  const joursVides = joursSansCommande(data);

  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <h3 className="titre-marque text-2xl">Commandes par jour de la semaine</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {pic
          ? `Jour le plus chargé : ${pic.jour} (${libelleNombreCommandes(pic.nombreCommandes)}).`
          : surPeriode
            ? 'Aucune commande sur cette période.'
            : 'Aucune commande pour le moment.'}
        {pic && joursVides.length > 0 && ` Aucune commande : ${joursVides.join(', ')}.`}
      </p>

      {/* Le graphique est décrit en une phrase pour les lecteurs d'écran */}
      {pic && (
        <div
          role="img"
          aria-label={`Commandes par jour de la semaine : ${descriptionCommandesParJour(data)}`}
          className="mt-4 h-64 w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="jour"
                tickFormatter={abreger}
                interval={0}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 13 }}
                stroke="var(--border)"
              />
              <YAxis
                allowDecimals={false}
                width={32}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 13 }}
                stroke="var(--border)"
              />
              <Tooltip
                cursor={{ fill: 'var(--accent)' }}
                formatter={(value) => [libelleNombreCommandes(value), 'Commandes']}
                contentStyle={styleInfobulle}
              />
              <Bar
                dataKey="nombreCommandes"
                name="Commandes"
                radius={[6, 6, 0, 0]}
                isAnimationActive={false}
                label={{ position: 'top', fill: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}
              >
                {/* Le jour le plus chargé est le seul en accent */}
                {data.map((jour) => (
                  <Cell
                    key={jour.jour}
                    fill={pic && jour.jour === pic.jour ? 'var(--primary)' : 'var(--muted-foreground)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
