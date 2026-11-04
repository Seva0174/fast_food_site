// En-tête commun aux vues de l'administration : titre d'enseigne (même nom que l'onglet), compteur,
// une phrase de description et les actions de la vue à droite.
// refTitre : le focus revient au titre quand l'élément actif disparaît (suppression d'une ligne...).
export const EnTeteVueAdmin = ({ titre, compteur, description, actions, refTitre }) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h2 ref={refTitre} tabIndex={-1} className="titre-marque text-3xl outline-none">
        {titre}
        {compteur && (
          <span className="ml-3 align-middle font-sans text-base font-medium normal-case tabular-nums text-muted-foreground">
            {compteur}
          </span>
        )}
      </h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
    {actions}
  </div>
);
