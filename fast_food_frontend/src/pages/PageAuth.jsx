import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../context/AuthProvider';
import { registerApi } from '../api/authApi';
import { extraireMessageErreur } from '../lib/erreurs';
import { ChampAuth } from '../components/auth/ChampAuth';
import { Bouton } from '../components/ui/bouton';

const FORMULAIRE_VIDE = { nom: '', email: '', mdp: '', confirmationMdp: '' };
const MESSAGE_ERREUR_PAR_DEFAUT = 'Une erreur est survenue lors du traitement.';
const MESSAGE_INSCRIPTION_PAR_DEFAUT = 'Inscription réussie ! Veuillez vérifier votre boîte mail.';

const STYLES_MESSAGE = {
  erreur: { classes: 'bg-red-50 border-red-200 text-red-700', icone: AlertCircle },
  succes: { classes: 'bg-green-50 border-green-200 text-green-700', icone: CheckCircle2 },
};

const MessageFormulaire = ({ type, texte }) => {
  const { classes, icone: Icone } = STYLES_MESSAGE[type];

  return (
    <div className={`mb-6 p-4 border text-sm rounded-xl flex items-center gap-2 ${classes}`}>
      <Icone className="w-5 h-5 flex-shrink-0" />
      <span>{texte}</span>
    </div>
  );
};

export const PageAuth = ({ inscription = false }) => {
  const [estConnexion, setEstConnexion] = useState(!inscription);
  const [formulaire, setFormulaire] = useState(FORMULAIRE_VIDE);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [chargement, setChargement] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

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
        await login(formulaire.email, formulaire.mdp);
        navigate('/');
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

  return (
    <div className="max-w-md mx-auto my-10 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-red-50 text-red-600 rounded-xl mb-3">
          {estConnexion ? <LogIn className="w-8 h-8" /> : <UserPlus className="w-8 h-8" />}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {estConnexion ? 'Connexion' : 'Inscription'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {estConnexion
            ? 'Accédez à votre compte pour commander'
            : 'Rejoignez-nous pour commander rapidement'}
        </p>
      </div>

      {erreur && <MessageFormulaire type="erreur" texte={erreur} />}
      {succes && <MessageFormulaire type="succes" texte={succes} />}

      <form onSubmit={valider} className="space-y-4">
        {!estConnexion && (
          <ChampAuth
            libelle="Nom complet"
            icone={User}
            name="nom"
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
          value={formulaire.email}
          onChange={modifierChamp}
          placeholder="exemple@domaine.com"
        />

        <ChampAuth
          libelle="Mot de passe"
          icone={Lock}
          name="mdp"
          type="password"
          value={formulaire.mdp}
          onChange={modifierChamp}
          placeholder="••••••••"
        />

        {!estConnexion && (
          <ChampAuth
            libelle="Confirmer le mot de passe"
            icone={Lock}
            name="confirmationMdp"
            type="password"
            value={formulaire.confirmationMdp}
            onChange={modifierChamp}
            placeholder="••••••••"
          />
        )}

        <Bouton
          type="submit"
          taille="lg"
          className="mt-2 w-full rounded-xl font-bold shadow-md"
          disabled={chargement}
        >
          {libelleSoumission()}
        </Bouton>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        {estConnexion ? 'Pas encore de compte ?' : 'Déjà un compte ?'}{' '}
        <Bouton variante="lien" taille="nu" onClick={basculerMode}>
          {estConnexion ? 'Créer un compte' : 'Se connecter'}
        </Bouton>
      </p>
    </div>
  );
};