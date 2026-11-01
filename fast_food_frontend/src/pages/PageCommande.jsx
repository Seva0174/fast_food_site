import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ContextePanier } from '../context/ContextePanier';
import { AuthContext } from '../context/AuthProvider';
import { passerCommandeApi } from '../api/commandeApi';
import { useAdresseLivraison } from '../hooks/useAdresseLivraison';
import { extraireMessageErreur } from '../lib/erreurs';
import { TYPE_RETRAIT } from '../lib/commande';
import { CHAMPS_ADRESSE, verifierAdresse } from '../lib/adresse';
import { TicketCommande } from '../components/commande/TicketCommande';
import { BarreValidationMobile } from '../components/commande/BarreValidationMobile';
import { RecapitulatifCommande } from '../components/commande/RecapitulatifCommande';
import { FormulaireRetrait } from '../components/commande/FormulaireRetrait';

const MESSAGE_ERREUR_PAR_DEFAUT = 'Une erreur est survenue lors de la validation de la commande.';

const TitrePage = () => <h1 className="titre-marque text-5xl sm:text-6xl">Valider la commande</h1>;

// Emplacement des deux cartes pendant le chargement du panier
const CommandeEnChargement = () => (
  <div role="status" className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
    <span className="sr-only">Chargement du panier…</span>
    <div className="squelette h-64 rounded-2xl" aria-hidden="true" />
    <div className="squelette h-80 rounded-2xl" aria-hidden="true" />
  </div>
);

const CommandeVide = () => (
  <div className="mt-6 rounded-2xl border border-border bg-card px-6 py-12 text-center">
    <p className="titre-marque text-3xl">Votre panier est vide</p>
    <p className="mt-2 text-sm text-muted-foreground">
      Ajoutez des produits depuis la carte pour passer commande.
    </p>
    <Link
      to="/"
      className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
    >
      Voir la carte
    </Link>
  </div>
);

// Page protegee par ProtectedRoute (voir App.jsx) : l'utilisateur est toujours connecte ici.
export const PageCommande = () => {
  const {
    panier,
    chargement: panierEnChargement,
    viderPanier,
    totalPrix,
    incrementerQuantite,
    retirerDuPanier,
    supprimerDuPanier,
    demanderOuverturePanier,
  } = useContext(ContextePanier);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [typeRetrait, setTypeRetrait] = useState(TYPE_RETRAIT.CLICK_AND_COLLECT);
  const { adresse, modifierChamp } = useAdresseLivraison(user.id);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');
  const [erreursAdresse, setErreursAdresse] = useState({});
  const [commandeConfirmee, setCommandeConfirmee] = useState(null);

  // Une saisie efface l'erreur du champ concerne
  const changerChampAdresse = (nom, valeur) => {
    modifierChamp(nom, valeur);
    setErreursAdresse((prev) => ({ ...prev, [nom]: undefined }));
  };

  // "Modifier" : retour a la carte avec le panier ouvert (tiroir sur mobile, panier lateral sur PC)
  const modifierPanier = () => {
    demanderOuverturePanier();
    navigate('/');
  };

  const validerCommande = async (e) => {
    e.preventDefault();
    setErreur('');

    if (panier.length === 0) {
      setErreur('Votre panier est vide.');
      return;
    }

    if (typeRetrait === TYPE_RETRAIT.LIVRAISON) {
      const erreurs = verifierAdresse(adresse);
      setErreursAdresse(erreurs);
      const premierChamp = CHAMPS_ADRESSE.find((champ) => erreurs[champ]);
      if (premierChamp) {
        document.getElementById(premierChamp)?.focus();
        return;
      }
    }

    setEnvoi(true);

    try {
      const commande = await passerCommandeApi(typeRetrait, adresse);
      // Le ticket s'affiche avant de vider le panier : pas de passage par l'etat "panier vide"
      setCommandeConfirmee(commande);
      window.scrollTo({ top: 0 });
      await viderPanier();
    } catch (err) {
      setErreur(extraireMessageErreur(err) ?? MESSAGE_ERREUR_PAR_DEFAUT);
    } finally {
      setEnvoi(false);
    }
  };

  if (commandeConfirmee) return <TicketCommande commande={commandeConfirmee} />;

  if (panierEnChargement) {
    return (
      <div className="mx-auto max-w-5xl">
        <TitrePage />
        <CommandeEnChargement />
      </div>
    );
  }

  if (panier.length === 0) {
    return (
      <div className="mx-auto max-w-5xl">
        <TitrePage />
        <CommandeVide />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <TitrePage />

      {/* Sur mobile, le mode de retrait passe avant le recapitulatif (replie) :
          on ne peut pas valider sans l'avoir vu. Sur PC, panier a gauche, retrait a droite. */}
      <div className="mt-6 grid grid-cols-1 items-start gap-6 md:grid-cols-2 md:gap-8">
        <div className="order-2 md:order-1">
          <RecapitulatifCommande
            panier={panier}
            totalPrix={totalPrix}
            onDiminuer={retirerDuPanier}
            onAugmenter={incrementerQuantite}
            onSupprimer={supprimerDuPanier}
            onModifier={modifierPanier}
          />
        </div>

        <div className="order-1 md:order-2">
          <FormulaireRetrait
            typeRetrait={typeRetrait}
            onChangerType={setTypeRetrait}
            adresse={adresse}
            onChangerChamp={changerChampAdresse}
            onSubmit={validerCommande}
            chargement={envoi}
            panierVide={false}
            erreur={erreur}
            erreursAdresse={erreursAdresse}
          />
        </div>
      </div>

      <BarreValidationMobile
        totalPrix={totalPrix}
        typeRetrait={typeRetrait}
        chargement={envoi}
        desactive={false}
      />
    </div>
  );
};
