import { Link } from 'react-router-dom';
import { useTitrePage } from '@/hooks/useTitrePage';

// Page sans contenu utilisable (adresse inconnue, accès refusé) : on dit pourquoi et on propose une sortie,
// dans la navbar et le footer habituels.
export const PageArret = ({ titre, texte, lien }) => {
  useTitrePage(titre);

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card px-6 py-12 text-center sm:py-16">
      <h1 className="titre-marque text-4xl sm:text-5xl">{titre}</h1>
      <p className="mt-3 text-muted-foreground">{texte}</p>
      <Link
        to={lien.to}
        className="mt-8 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {lien.libelle}
      </Link>
    </div>
  );
};
