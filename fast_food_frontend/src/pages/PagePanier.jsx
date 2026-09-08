import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ContextePanier } from '../context/ContextePanier';
import { AuthContext } from '../context/AuthContext';
import { Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

export const PagePanier = () => {
  const { panier, ajouterAuPanier, retirerDuPanier, supprimerDuPanier, totalPrix } = useContext(ContextePanier);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const validerCommande = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/commander'); // Page finale de commande/livraison
    }
  };

  if (panier.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">Votre panier est vide</h2>
        <p className="text-gray-500 mt-2">Découvrez nos produits et ajoutez vos burgers préférés !</p>
        <Link
          to="/"
          className="inline-block mt-6 bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition"
        >
          Voir la carte
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900">Votre Panier</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-6">
        <div className="divide-y divide-gray-100">
          {panier.map((item) => (
            <div key={item.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.imageUrl || item.image_url ? (
                    <img src={item.imageUrl || item.image_url} alt={item.nom} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🍔</div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{item.nom}</h3>
                  <p className="text-sm text-gray-500">{Number(item.prix).toFixed(2)} € / unité</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Contrôle de quantité */}
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => retirerDuPanier(item.id)}
                    className="p-1 hover:bg-gray-100 rounded text-gray-600"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-gray-800 px-2">{item.quantite}</span>
                  <button
                    onClick={() => ajouterAuPanier(item)}
                    className="p-1 hover:bg-gray-100 rounded text-gray-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <span className="font-extrabold text-gray-900 w-20 text-right">
                  {(item.prix * item.quantite).toFixed(2)} €
                </span>

                <button
                  onClick={() => supprimerDuPanier(item.id)}
                  className="text-gray-400 hover:text-red-600 transition p-1"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Récapitulatif du total */}
        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-gray-500 text-sm">Total de la commande :</span>
            <div className="text-3xl font-extrabold text-gray-900">{totalPrix.toFixed(2)} €</div>
          </div>

          <button
            onClick={validerCommande}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-lg"
          >
            <span>{user ? 'Valider la commande' : 'Se connecter pour commander'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};