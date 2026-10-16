import { Truck, Store } from 'lucide-react';
import { Bouton } from '../ui/bouton';
import { TYPE_RETRAIT } from '../../lib/commande';

// Tuile de choix du mode de retrait (bouton avec icone, different d'un Bouton classique)
const TuileRetrait = ({ actif, icone: Icone, libelle, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition ${
      actif
        ? 'border-red-600 bg-red-50 text-red-700 font-bold'
        : 'border-gray-200 hover:border-gray-300 text-gray-600'
    }`}
  >
    <Icone className="w-6 h-6 mb-1" />
    <span className="text-sm">{libelle}</span>
  </button>
);

const ChampAdresse = ({ libelle, name, value, placeholder, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{libelle}</label>
    <input
      type="text"
      name={name}
      required
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 border-gray-300"
    />
  </div>
);

export const FormulaireRetrait = ({
  typeRetrait,
  onChangerType,
  adresse,
  onChangerChamp,
  onSubmit,
  chargement,
  panierVide,
  erreur,
}) => (
  <div className="bg-white p-6 shadow-md rounded-lg border border-gray-100">
    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Mode de retrait</h2>

    {erreur && (
      <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm">
        {erreur}
      </div>
    )}

    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <TuileRetrait
          actif={typeRetrait === TYPE_RETRAIT.LIVRAISON}
          icone={Truck}
          libelle="Livraison"
          onClick={() => onChangerType(TYPE_RETRAIT.LIVRAISON)}
        />
        <TuileRetrait
          actif={typeRetrait === TYPE_RETRAIT.CLICK_AND_COLLECT}
          icone={Store}
          libelle="Click & Collect"
          onClick={() => onChangerType(TYPE_RETRAIT.CLICK_AND_COLLECT)}
        />
      </div>

      {typeRetrait === TYPE_RETRAIT.LIVRAISON ? (
        <div className="space-y-4 pt-2">
          <ChampAdresse
            libelle="Rue / Adresse"
            name="cpRue"
            value={adresse.cpRue}
            placeholder="ex: 12 Rue de la Paix"
            onChange={onChangerChamp}
          />

          <div className="grid grid-cols-2 gap-4">
            <ChampAdresse
              libelle="Code Postal"
              name="cpCodePostal"
              value={adresse.cpCodePostal}
              placeholder="75000"
              onChange={onChangerChamp}
            />
            <ChampAdresse
              libelle="Ville"
              name="cpVille"
              value={adresse.cpVille}
              placeholder="Paris"
              onChange={onChangerChamp}
            />
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 text-center">
          Retrait en restaurant : Vous viendrez récupérer votre commande directement au comptoir une
          fois qu'elle sera marquée comme "Prête".
        </div>
      )}

      <Bouton
        type="submit"
        variante="succes"
        taille="lg"
        className="w-full mt-6"
        disabled={chargement || panierVide}
      >
        {chargement ? 'Traitement en cours...' : 'Valider et commander'}
      </Bouton>
    </form>
  </div>
);