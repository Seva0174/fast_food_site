// Conteneur blanc d'une vue d'administration : titre, sous-titre, actions à droite puis contenu.
export const PanneauAdmin = ({ titre, sousTitre, actions, children }) => (
  <div className="space-y-6 rounded-lg border bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between border-b pb-4">
      <div>
        <h2 className="text-xl font-bold text-gray-800">{titre}</h2>
        {sousTitre && <p className="text-sm text-gray-500">{sousTitre}</p>}
      </div>
      {actions}
    </div>
    {children}
  </div>
);