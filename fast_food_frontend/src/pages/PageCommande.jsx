import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ContextePanier } from '../context/ContextePanier';
import { AuthContext } from '../context/AuthProvider';
import { passerCommandeApi } from '../api/commandeApi';

export const PageCommande = () => {
  const { panier, viderPanier, totalPrix, ajouterAuPanier, retirerDuPanier, supprimerDuPanier } =
    useContext(ContextePanier);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [adresse, setAdresse] = useState({
    cpRue: '',
    cpVille: '',
    cpCodePostal: '',
  });
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  const handleChange = (e) => {
    setAdresse({ ...adresse, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');

    if (!panier || panier.length === 0) {
      setErreur('Votre panier est vide.');
      return;
    }

    setChargement(true);

    try {
      await passerCommandeApi(adresse);
      viderPanier(); // On vide le panier local après validation réussie
      alert('Commande effectuée avec succès ! Un e-mail de confirmation vous a été envoyé.');
      navigate('/');
    } catch (err) {

        const data = err.response?.data;
        if (data?.messages && Array.isArray(data.messages)) {
            setErreur(data.messages.join(' | '));
        } else if (data?.message) {
            setErreur(data.message);
        } else {
            setErreur("Une erreur est survenue lors de la validation de la commande.");
        }
        
    }finally {
      setChargement(false);
    }
  };

  // Redirection / Invitation à se connecter si l'utilisateur n'est pas authentifié
  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white shadow-md rounded-lg text-center border border-gray-100">
        <h2 className="text-2xl font-bold mb-3 text-gray-800">Connexion requise</h2>
        <p className="text-gray-600 mb-6">
          Veuillez vous connecter à votre compte pour finaliser votre commande.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 bg-yellow-500 text-white font-semibold rounded-md shadow hover:bg-yellow-600 transition duration-200"
        >
          Se connecter / S'inscrire
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-6 shadow-md rounded-lg border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
          Récapitulatif de votre commande
        </h2>

        {panier.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Votre panier est actuellement vide.</p>
            <Link to="/" className="text-yellow-600 font-semibold hover:underline">
              ← Retourner au menu
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
              {panier.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div className="flex-1 pr-2">
                    <p className="font-semibold text-gray-800">{item.nom}</p>
                    <p className="text-sm text-gray-500">
                      {Number(item.prix).toFixed(2)} € / unité
                    </p>
                  </div>

                  {/* Contrôle des quantités */}
                  <div className="flex items-center space-x-2 mr-4">
                    <button
                      type="button"
                      onClick={() => retirerDuPanier(item.id)}
                      className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded font-bold text-gray-700 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-semibold text-sm w-4 text-center">{item.quantite}</span>
                    <button
                      type="button"
                      onClick={() => ajouterAuPanier(item)}
                      className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded font-bold text-gray-700 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>

                  {/* Sous-total par article */}
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      {(item.quantite * item.prix).toFixed(2)} €
                    </p>
                    <button
                      type="button"
                      onClick={() => supprimerDuPanier(item.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t flex justify-between items-center text-lg font-bold">
              <span>Total à payer :</span>
              <span className="text-yellow-600">{totalPrix ? totalPrix.toFixed(2) : '0.00'} €</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 shadow-md rounded-lg border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
          Adresse de livraison
        </h2>

        {erreur && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm">
            {erreur}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rue / Adresse
            </label>
            <input
              type="text"
              name="cpRue"
              required
              value={adresse.cpRue}
              onChange={handleChange}
              placeholder="ex: 12 Rue de la Paix"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 border-gray-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code Postal
              </label>
              <input
                type="text"
                name="cpCodePostal"
                required
                value={adresse.cpCodePostal}
                onChange={handleChange}
                placeholder="75000"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville
              </label>
              <input
                type="text"
                name="cpVille"
                required
                value={adresse.cpVille}
                onChange={handleChange}
                placeholder="Paris"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 border-gray-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={chargement || panier.length === 0}
            className="w-full mt-6 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md shadow disabled:opacity-50 transition duration-200"
          >
            {chargement ? 'Traitement en cours...' : 'Valider et commander'}
          </button>
        </form>
      </div>
    </div>
  );
};