export const CarteStatistique = ({ libelle, valeur, classes }) => (
  <div className={`rounded-lg border p-4 ${classes.fond}`}>
    <p className={`text-sm font-medium ${classes.libelle}`}>{libelle}</p>
    <p className={`text-2xl font-bold ${classes.valeur}`}>{valeur}</p>
  </div>
);