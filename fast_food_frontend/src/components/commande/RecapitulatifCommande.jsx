import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ComposantsFormule } from '../produits/ComposantsFormule';
import { QuantiteStepper } from '../panier/QuantiteStepper';
import { Bouton } from '../ui/bouton';

const LigneRecapitulatif = ({ item, onDiminuer, onAugmenter, onSupprimer }) => (
  <div className="py-3 flex items-start justify-between">
    <div className="flex-1 pr-2">
      <p className="font-semibold text-gray-800">{item.nom}</p>

      {item.options.length > 0 && (
        <p className="text-xs text-gray-500 mt-0.5">
          <span className="font-medium text-gray-600">Options : </span>
          {item.options.map((option) => option.nom).join(', ')}
        </p>
      )}

      <ComposantsFormule composants={item.composants} />

      <p className="text-xs text-gray-400 mt-1">{Number(item.prix).toFixed(2)} € / unité</p>
    </div>

    <div className="mr-4">
      <QuantiteStepper
        quantite={item.quantite}
        onDiminuer={onDiminuer}
        onAugmenter={onAugmenter}
      />
    </div>

    <div className="text-right">
      <p className="font-bold text-gray-800">{(item.quantite * item.prix).toFixed(2)} €</p>
      <Bouton variante="danger" taille="xs" className="mt-1" onClick={onSupprimer}>
        Supprimer
      </Bouton>
    </div>
  </div>
);

export const RecapitulatifCommande = ({
  panier,
  totalPrix,
  onDiminuer,
  onAugmenter,
  onSupprimer,
}) => (
  <div className="bg-white p-6 shadow-md rounded-lg border border-gray-100">
    <div className="flex justify-between items-center mb-4 border-b pb-2">
      <h2 className="text-xl font-bold text-gray-800">Récapitulatif de votre commande</h2>
      <Link to="/" className="text-xs text-red-600 hover:underline flex items-center gap-1">
        <ArrowLeft className="w-3.5 h-3.5" />
        Modifier mes choix
      </Link>
    </div>

    {panier.length === 0 ? (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Votre panier est actuellement vide.</p>
        <Link to="/" className="text-yellow-600 font-semibold hover:underline">
          Retourner au menu
        </Link>
      </div>
    ) : (
      <div className="space-y-4">
        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
          {panier.map((item) => (
            <LigneRecapitulatif
              key={item.id}
              item={item}
              onDiminuer={() => onDiminuer(item.id)}
              onAugmenter={() => onAugmenter(item.id)}
              onSupprimer={() => onSupprimer(item.id)}
            />
          ))}
        </div>

        <div className="pt-4 border-t flex justify-between items-center text-lg font-bold">
          <span>Total à payer :</span>
          <span className="text-yellow-600">{totalPrix.toFixed(2)} €</span>
        </div>
      </div>
    )}
  </div>
);