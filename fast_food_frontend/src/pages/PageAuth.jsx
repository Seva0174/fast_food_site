import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';
import { registerApi } from '../api/authApi';
import { LogIn, UserPlus, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';

export const PageAuth = () => {
  const [estConnexion, setEstConnexion] = useState(true);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [chargement, setChargement] = useState(false);

  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    mdp: '',
    confirmationMdp: ''
  });

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setSucces('');
    setChargement(true);

    try {
      if (estConnexion) {
        await login(formData.email, formData.mdp);
        navigate('/');
      } else {
        if (formData.mdp !== formData.confirmationMdp) {
          setErreur('Les mots de passe ne correspondent pas.');
          setChargement(false);
          return;
        }

        const message = await registerApi(formData.nom, formData.email, formData.mdp);
        setSucces(message || 'Inscription réussie ! Veuillez vérifier votre boîte mail.');
        setEstConnexion(true);
      }
    } catch (err) {
      setErreur(err.response?.data?.message || 'Une erreur est survenue lors du traitement.');
    } finally {
      setChargement(false);
    }
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

      {erreur && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{erreur}</span>
        </div>
      )}

      {succes && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{succes}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!estConnexion && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="nom"
                required={!estConnexion}
                value={formData.nom}
                onChange={handleChange}
                placeholder="Jean Dupont"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm outline-none transition"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail</label>
          <div className="relative">
            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="exemple@domaine.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <div className="relative">
            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              name="mdp"
              required
              value={formData.mdp}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm outline-none transition"
            />
          </div>
        </div>

        {!estConnexion && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="confirmationMdp"
                required={!estConnexion}
                value={formData.confirmationMdp}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm outline-none transition"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={chargement}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 mt-2"
        >
          {chargement
            ? 'Traitement...'
            : estConnexion
            ? 'Se connecter'
            : "S'inscrire"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        {estConnexion ? 'Pas encore de compte ?' : 'Déjà un compte ?'}{' '}
        <button
          type="button"
          onClick={() => {
            setEstConnexion(!estConnexion);
            setErreur('');
            setSucces('');
          }}
          className="text-red-600 font-semibold hover:underline bg-transparent border-none cursor-pointer"
        >
          {estConnexion ? 'Créer un compte' : 'Se connecter'}
        </button>
      </p>
    </div>
  );
};