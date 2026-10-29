import { Bouton } from '../ui/bouton';

// Photo a placer dans public/img/hero.jpg (fond sombre, produit plutot a droite).
// Si le fichier est absent, la banniere reste lisible sur fond anthracite.
const IMAGE_BANNIERE = '/img/hero.jpg';

// Banniere pleine largeur, a rendre en dehors du conteneur centre
// (voir ROUTES_PLEINE_LARGEUR dans MainLayout.jsx).
// Sur bureau, elle occupe exactement l'ecran sous la navbar : c'est la premiere
// "diapositive" (voir useDiapositiveHero). Sur mobile, elle est plus courte.
export const HeroBanner = ({ ref, onCommander }) => (
  <section
    ref={ref}
    className="relative isolate flex h-[55svh] min-h-[360px] items-center overflow-hidden border-b border-border bg-card lg:h-[calc(100svh-4rem)]"
  >
    <img
      src={IMAGE_BANNIERE}
      alt=""
      aria-hidden="true"
      className="absolute inset-0 -z-20 h-full w-full object-cover object-center lg:object-right"
      onError={(e) => {
        e.currentTarget.hidden = true;
      }}
    />

    {/* Degrade lateral : garantit la lisibilite du texte sur la photo */}
    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/75 to-background/10" />

    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="titre-marque text-6xl sm:text-7xl lg:text-8xl">
          Le goût de la rue, livré chez vous
        </h1>
        <p className="mt-4 max-w-md text-base text-muted-foreground sm:text-lg">
          Burgers, tacos et menus préparés à la commande. Livraison ou click &amp; collect.
        </p>
        <Bouton taille="lg" className="mt-8 px-8 text-lg" onClick={onCommander}>
          Commander maintenant
        </Bouton>
      </div>
    </div>
  </section>
);