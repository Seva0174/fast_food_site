import { EMAIL_CONTACT, NOM_SITE } from '../lib/site';

// Lien dans le texte : souligne pour etre reconnu, l'orange reste dans le soulignement
const classeLien =
  'text-foreground underline decoration-primary/60 underline-offset-4 transition-colors hover:decoration-primary';

// Section de page de lecture : plus d'espace au-dessus du titre qu'en dessous
const SectionLegale = ({ titre, children }) => (
  <section className="border-t border-border pt-6">
    <h2 className="titre-marque text-3xl text-foreground">{titre}</h2>
    <div className="mt-3 space-y-3">{children}</div>
  </section>
);

export const MentionsLegales = () => (
  <article className="mx-auto max-w-prose py-4 sm:py-8">
    <h1 className="titre-marque text-5xl sm:text-6xl">Mentions légales</h1>

    <div className="mt-8 space-y-8 text-pretty text-base leading-relaxed text-muted-foreground">
      <SectionLegale titre="Projet personnel">
        <p>
          {NOM_SITE} est un projet réalisé dans un cadre académique. Il ne s’agit pas d’un service
          réel de restauration.
        </p>
      </SectionLegale>

      <SectionLegale titre="Éditeur du site">
        <p className="text-foreground">Seva Cinque</p>
        <p>
          E-mail :{' '}
          <a href={`mailto:${EMAIL_CONTACT}`} className={classeLien}>
            {EMAIL_CONTACT}
          </a>{' '}  (e-mail factice)
        </p>
      </SectionLegale>

      <SectionLegale titre="Hébergement">
        <p>Aucun.</p>
      </SectionLegale>

      <SectionLegale titre="Données personnelles">
        <p>
          Ce site peut collecter certaines données dans le cadre du projet (ex : gestion des
          commandes). Ces données ne sont utilisées que dans un cadre pédagogique et ne sont pas
          exploitées à des fins commerciales.
        </p>
        <p>
          Conformément au RGPD, vous pouvez demander la modification ou la suppression de vos
          données en contactant l’éditeur du site.
        </p>
      </SectionLegale>

      <SectionLegale titre="Propriété intellectuelle">
        <p>
          Les textes, éléments graphiques et éléments d’interface créés dans le cadre de ce projet
          sont protégés par les droits applicables à la propriété intellectuelle.
        </p>
        <p>
          Certaines images utilisées sur ce site proviennent d’
          <a
            href="https://unsplash.com/fr/licence"
            target="_blank"
            rel="noopener noreferrer"
            className={classeLien}
          >
            Unsplash
            <span className="sr-only"> (s’ouvre dans un nouvel onglet)</span>
          </a>
          . Elles sont utilisées conformément à la licence Unsplash. Les droits relatifs à ces
          images restent soumis aux conditions de cette licence et aux éventuels droits de tiers.
        </p>
      </SectionLegale>
    </div>
  </article>
);
