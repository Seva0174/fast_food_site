import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContextePanier } from '../context/ContextePanier';
import { AuthContext } from '../context/AuthProvider';
import { passerCommandeApi } from '../api/commandeApi';
import { useAdresseLivraison } from '../hooks/useAdresseLivraison';
import { extraireMessageErreur } from '../lib/erreurs';
import { TYPE_RETRAIT } from '../lib/commande';
import { Bouton } from '../components/ui/bouton';
import { RecapitulatifCommande } from '../components/commande/RecapitulatifCommande';
import { FormulaireRetrait } from '../components/commande/FormulaireRetrait';

const MESSAGE_ERREUR_PAR_DEFAUT = 'Une erreur est survenue lors de la validation de la commande.';

// Page protegee par ProtectedRoute (voir App.jsx) : l'utilisateur est toujours connecte ici.
export const PageCommande = () => {
  const { panier, viderPanier, totalPrix, incrementerQuantite, retirerDuPanier, supprimerDuPanier } =
    useContext(ContextePanier);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [typeRetrait, setTypeRetrait] = useState(TYPE_RETRAIT.LIVRAISON);
  const { adresse, modifierChamp } = useAdresseLivraison(user.id);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [commandeConfirmee, setCommandeConfirmee] = useState(false);

  const validerCommande = async (e) => {
    e.preventDefault();
    setErreur('');

    if (panier.length === 0) {
      setErreur('Votre panier est vide.');
      return;
    }

    setChargement(true);

    try {
      await passerCommandeApi(typeRetrait, adresse);
      await viderPanier();
      setCommandeConfirmee(true);
    } catch (err) {
      setErreur(extraireMessageErreur(err) ?? MESSAGE_ERREUR_PAR_DEFAUT);
    } finally {
      setChargement(false);
    }
  };

  if (commandeConfirmee) {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <h1 className="text-2xl font-extrabold text-green-800">Commande effectuée avec succès</h1>
        <p className="text-sm text-green-700">Un e-mail de confirmation vous a été envoyé.</p>
        <Bouton onClick={() => navigate('/')}>Retour à la carte</Bouton>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      <RecapitulatifCommande
        panier={panier}
        totalPrix={totalPrix}
        onDiminuer={retirerDuPanier}
        onAugmenter={incrementerQuantite}
        onSupprimer={supprimerDuPanier}
      />

      <FormulaireRetrait
        typeRetrait={typeRetrait}
        onChangerType={setTypeRetrait}
        adresse={adresse}
        onChangerChamp={modifierChamp}
        onSubmit={validerCommande}
        chargement={chargement}
        panierVide={panier.length === 0}
        erreur={erreur}
      />
    </div>
  );
};