import { Bouton } from '../ui/bouton';

// Photo a placer dans public/img/hero.jpg (fond sombre, produit plutot a droite).
// Si le fichier est absent, la banniere reste lisible sur fond anthracite.
const IMAGE_BANNIERE = '/img/hero.jpg';

// Banniere pleine largeur. Elle doit etre rendue en dehors du conteneur centre
// (voir ROUTES_PLEINE_LARGEUR dans MainLayout.jsx).
export const HeroBanner = ({ onCommander }) => (
  <section className="relative isolate flex h-[55svh] min-h-[360px] items-center overflow-hidden bg-card md:h-[calc(100svh-4rem)] md:max-h-[760px]">
    <img
      src={IMAGE_BANNIERE}
      alt=""
      aria-hidden="true"
      className="absolute inset-0 -z-30 h-full w-full object-cover object-center md:object-right"
      onError={(e) => {
        e.currentTarget.hidden = true;
      }}
    />

    {/* Degrade lateral : garantit la lisibilite du texte sur la photo */}
    <div className="absolute inset-0 -z-20 bg-gradient-to-r from-background via-background/75 to-background/10" />
    {/* Fondu en bas : la banniere se raccorde au fond de la page */}
    <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-background to-transparent" />

    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        {/* Deux temps : « Fast-Food » ne se coupe jamais au tiret, « pour le peuple » reprend sur sa ligne */}
        <h1 className="titre-marque text-balance text-5xl max-[340px]:text-4xl min-[440px]:text-6xl sm:text-7xl lg:text-8xl">
          <span className="block">
            Le <span className="whitespace-nowrap">Fast-Food</span> du peuple,
          </span>{' '}
          <span className="block">pour le peuple</span>
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
