// Styles de chaque variante d'onglets.
const STYLES = {
  soulignes: {
    conteneur: 'flex gap-2 rounded-t-lg border-b border-gray-200 bg-white px-4 pt-3',
    onglet: 'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
    actif: 'border-red-500 text-red-600',
    inactif: 'border-transparent text-gray-500 hover:text-gray-700',
  },
  segments: {
    conteneur: 'flex rounded-lg bg-gray-100 p-1',
    onglet: 'rounded-md px-4 py-1.5 text-xs font-semibold transition',
    actif: 'bg-white text-gray-900 shadow-sm',
    inactif: 'text-gray-500 hover:text-gray-700',
  },
};

// Barre d'onglets. Chaque onglet se décrit par { id, libelle }.
// Variantes : 'soulignes' (par défaut) ou 'segments'.
export const Onglets = ({ onglets, actif, onChange, variante = 'soulignes' }) => {
  const styles = STYLES[variante];

  return (
    <div role="tablist" className={styles.conteneur}>
      {onglets.map((onglet) => (
        <button
          key={onglet.id}
          type="button"
          role="tab"
          aria-selected={actif === onglet.id}
          onClick={() => onChange(onglet.id)}
          className={`${styles.onglet} ${actif === onglet.id ? styles.actif : styles.inactif}`}
        >
          {onglet.libelle}
        </button>
      ))}
    </div>
  );
};