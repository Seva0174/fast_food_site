import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContextePanier } from '../context/ContextePanier';
import { AuthContext } from '../context/AuthProvider';
import { passerCommandeApi } from '../api/commandeApi';
import { useAdresseLivraison } from '../hooks/useAdresseLivraison';
import { extraireMessageErreur } from '../lib/erreurs';
import { TYPE_RETRAIT } from '../lib/commande';
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
      alert('Commande effectuée avec succès ! Un e-mail de confirmation vous a été envoyé.');
      navigate('/');
    } catch (err) {
      setErreur(extraireMessageErreur(err) ?? MESSAGE_ERREUR_PAR_DEFAUT);
    } finally {
      setChargement(false);
    }
  };

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