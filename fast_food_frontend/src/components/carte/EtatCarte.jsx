import { RotateCcw } from 'lucide-react';
import { Bouton } from '../ui/bouton';

const CarteSquelette = () => (
  <div className="overflow-hidden rounded-xl border border-border bg-card" aria-hidden="true">
    <div className="squelette aspect-[4/3]" />
    <div className="space-y-3 p-3 sm:p-4">
      <div className="squelette h-6 w-3/4 rounded" />
      <div className="squelette h-4 w-full rounded" />
      <div className="squelette h-9 w-full rounded-lg" />
    </div>
  </div>
);

// Grille de cartes vides affichee pendant le chargement, a la place exacte de la carte.
export const CarteEnChargement = () => (
  <div role="status" className="space-y-4 pt-6">
    <span className="sr-only">Chargement de la carte…</span>
    <div className="squelette h-9 w-40 rounded" aria-hidden="true" />
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <CarteSquelette key={i} />
      ))}
    </div>
  </div>
);

export const CarteEnErreur = ({ message, onReessayer }) => (
  <div role="alert" className="mt-6 rounded-2xl border border-border bg-card p-6 text-center sm:p-10">
    <p className="titre-marque text-3xl">{message}</p>
    <p className="mt-2 text-sm text-muted-foreground">
      Le serveur ne répond pas. Vérifiez votre connexion puis réessayez.
    </p>
    <Bouton className="mt-6" onClick={onReessayer}>
      <RotateCcw className="h-4 w-4" aria-hidden="true" />
      Réessayer
    </Bouton>
  </div>
);
