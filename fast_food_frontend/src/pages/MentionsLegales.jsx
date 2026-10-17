import { EMAIL_CONTACT } from '../lib/site';

const SectionLegale = ({ titre, children }) => (
  <section>
    <h2 className="text-xl font-semibold text-gray-800 mb-2">{titre}</h2>
    {children}
  </section>
);

export const MentionsLegales = () => (
  <div className="max-w-4xl mx-auto px-4 py-10 text-gray-700">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">Mentions légales</h1>

    <div className="space-y-6 text-sm leading-relaxed">
      <SectionLegale titre="Éditeur du site">
        <p>Seva Cinque</p>
        <p>
          Email :{' '}
          <a href={`mailto:${EMAIL_CONTACT}`} className="text-red-600 hover:underline">
            {EMAIL_CONTACT}
          </a>
        </p>
      </SectionLegale>

      <SectionLegale titre="Hébergement">
        <p>aucun</p>
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
          Les contenus de ce site (textes, images, interface) sont utilisés dans un cadre
          pédagogique. Toute reproduction n’est pas autorisée sans accord préalable.
        </p>
      </SectionLegale>

      <SectionLegale titre="Projet personnel">
        <p>
          Ce site est un projet réalisé dans un cadre académique. Il ne s’agit pas d’un service
          réel de restauration.
        </p>
      </SectionLegale>
    </div>
  </div>
);