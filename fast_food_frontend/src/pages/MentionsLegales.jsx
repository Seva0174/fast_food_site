export const MentionsLegales = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-gray-700">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Mentions légales
      </h1>

      <div className="space-y-6 text-sm leading-relaxed">
        {/* Éditeur */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Éditeur du site
          </h2>
          <p>Seva Cinque</p>
          <p>
            Email :{" "}
            <a
              href="mailto:admin123@gmail.com"
              className="text-red-600 hover:underline"
            >
              admin123@gmail.com
            </a>
          </p>
        </section>

        {/* Hébergement */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Hébergement
          </h2>
          <p>aucun</p>
        </section>

        {/* Données personnelles */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Données personnelles
          </h2>
          <p>
            Ce site peut collecter certaines données dans le cadre du projet
            (ex : gestion des commandes). Ces données ne sont utilisées que dans
            un cadre pédagogique et ne sont pas exploitées à des fins commerciales.
          </p>
          <p>
            Conformément au RGPD, vous pouvez demander la modification ou la
            suppression de vos données en contactant l’éditeur du site.
          </p>
        </section>

        {/* Propriété intellectuelle */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Propriété intellectuelle
          </h2>
          <p>
            Les contenus de ce site (textes, images, interface) sont utilisés
            dans un cadre pédagogique. Toute reproduction n’est pas autorisée
            sans accord préalable.
          </p>
        </section>

        {/* Mention projet scolaire */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Projet personnel
          </h2>
          <p>
            Ce site est un projet réalisé dans un cadre académique. Il ne s’agit
            pas d’un service réel de restauration.
          </p>
        </section>
      </div>
    </div>
  );
};