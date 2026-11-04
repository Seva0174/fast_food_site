import { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { AuthContext } from '../context/AuthProvider';
import { registerApi } from '../api/authApi';
import { extraireMessageErreur } from '../lib/erreurs';
import { ChampAuth } from '../components/auth/ChampAuth';
import { Bouton } from '../components/ui/bouton';
import { BandeauMessage } from '../components/ui/bandeau';
import { ContextePanier } from '../context/ContextePanier';
import { formaterPrix } from '../lib/prix';
import { useTitrePage } from '@/hooks/useTitrePage';
import { destinationApresConnexion } from '@/lib/roles';

const FORMULAIRE_VIDE = { nom: '', email: '', mdp: '', confirmationMdp: '' };
const MESSAGE_ERREUR_PAR_DEFAUT = 'Une erreur est survenue lors du traitement.';
// Focus automatique sur le premier champ seulement avec une souris :
// sur mobile, il ouvrirait le clavier et masquerait la page.
const pointeurPrecis = () => window.matchMedia('(pointer: fine)').matches;

const MESSAGE_INSCRIPTION_PAR_DEFAUT = 'Inscription réussie ! Vérifie ta boîte mail.';

export const PageAuth = ({ inscription = false }) => {
  const [estConnexion, setEstConnexion] = useState(!inscription);
  useTitrePage(estConnexion ? 'Connexion' : 'Créer un compte');
  const [formulaire, setFormulaire] = useState(FORMULAIRE_VIDE);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [chargement, setChargement] = useState(false);

  const { login, effacerDeconnexion } = useContext(AuthContext);
  // Arrivee ici apres une deconnexion : c'est fait, les prochaines pages protegees redeviennent des destinations
  useEffect(() => effacerDeconnexion(), [effacerDeconnexion]);
  const { totalPrix, totalArticles } = useContext(ContextePanier);
  const navigate = useNavigate();
  const location = useLocation();

  // Page d'origine transmise par ProtectedRoute (ex : /commander depuis le panier)
  const depuis = location.state?.depuis;
  const depuisCommande = depuis === '/commander' && totalArticles > 0;

  const modifierChamp = (nom, valeur) => setFormulaire((prev) => ({ ...prev, [nom]: valeur }));

  const basculerMode = () => {
    setEstConnexion((connexion) => !connexion);
    setErreur('');
    setSucces('');
  };

  const valider = async (e) => {
    e.preventDefault();
    setErreur('');
    setSucces('');

    if (!estConnexion && formulaire.mdp !== formulaire.confirmationMdp) {
      setErreur('Les mots de passe ne correspondent pas.');
      return;
    }

    setChargement(true);

    try {
      if (estConnexion) {
        const utilisateur = await login(formulaire.email, formulaire.mdp);
        navigate(destinationApresConnexion(utilisateur, depuis), { replace: true });
      } else {
        const message = await registerApi(formulaire.nom, formulaire.email, formulaire.mdp);
        setSucces(message || MESSAGE_INSCRIPTION_PAR_DEFAUT);
        setEstConnexion(true);
      }
    } catch (err) {
      setErreur(extraireMessageErreur(err) ?? MESSAGE_ERREUR_PAR_DEFAUT);
    } finally {
      setChargement(false);
    }
  };

  const libelleSoumission = () => {
    if (chargement) return 'Traitement...';
    return estConnexion ? 'Se connecter' : "S'inscrire";
  };

  const sousTitre = () => {
    if (depuisCommande) {
      return estConnexion
        ? `Connecte-toi pour valider ton panier (${formaterPrix(totalPrix)}). Il est conservé.`
        : `Crée ton compte pour valider ton panier (${formaterPrix(totalPrix)}). Un e-mail de vérification te sera envoyé ; ton panier est conservé.`;
    }
    return estConnexion
      ? 'Retrouve tes commandes et commande en quelques secondes.'
      : 'Un e-mail de vérification te sera envoyé : clique sur son lien pour activer ton compte, puis connecte-toi pour commander.';
  };

  return (
    <div className="mx-auto my-6 max-w-md sm:my-12">
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h1 className="titre-marque text-5xl">{estConnexion ? 'Connexion' : 'Inscription'}</h1>
        <p className="mt-2 text-pretty text-sm text-muted-foreground">{sousTitre()}</p>

        <div className="mt-6 space-y-3 empty:hidden">
          {erreur && <BandeauMessage message={{ type: 'erreur', texte: erreur }} />}
          {succes && <BandeauMessage message={{ type: 'succes', texte: succes }} />}
        </div>

        <form onSubmit={valider} className="mt-6 space-y-4">
          {!estConnexion && (
            <ChampAuth
              libelle="Nom complet"
              icone={User}
              name="nom"
              autoComplete="name"
              value={formulaire.nom}
              onChange={modifierChamp}
              placeholder="Jean Dupont"
            />
          )}

          <ChampAuth
            libelle="Adresse e-mail"
            icone={Mail}
            name="email"
            type="email"
            autoComplete="email"
            autoFocus={pointeurPrecis()}
            value={formulaire.email}
            onChange={modifierChamp}
            placeholder="exemple@domaine.com"
          />

          <ChampAuth
            libelle="Mot de passe"
            icone={Lock}
            name="mdp"
            type="password"
            autoComplete={estConnexion ? 'current-password' : 'new-password'}
            value={formulaire.mdp}
            onChange={modifierChamp}
            placeholder="Ton mot de passe"
          />

          {!estConnexion && (
            <ChampAuth
              libelle="Confirmer le mot de passe"
              icone={Lock}
              name="confirmationMdp"
              type="password"
              autoComplete="new-password"
              value={formulaire.confirmationMdp}
              onChange={modifierChamp}
              placeholder="Le même mot de passe"
            />
          )}

          <Bouton type="submit" taille="lg" className="mt-2 w-full" disabled={chargement}>
            {libelleSoumission()}
          </Bouton>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {estConnexion ? 'Pas encore de compte ?' : 'Déjà un compte ?'}{' '}
        <Bouton variante="lien" taille="nu" className="font-semibold" onClick={basculerMode}>
          {estConnexion ? 'Créer un compte' : 'Se connecter'}
        </Bouton>
      </p>
    </div>
  );
};
