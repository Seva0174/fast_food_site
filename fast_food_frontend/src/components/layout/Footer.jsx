import { Link } from 'react-router-dom';
import { Bouton } from '../ui/bouton';
import { EMAIL_CONTACT } from '../../lib/site';

export const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 py-6 mt-auto">
    <div className="max-w-7xl mx-auto px-4 text-center text-sm">
      <p>© {new Date().getFullYear()} FastFood. Tous droits réservés.</p>

      <p className="mt-1 text-xs text-gray-500">Livraison à domicile et click & collect</p>

      <p className="mt-2">
        Contact :{' '}
        <a href={`mailto:${EMAIL_CONTACT}`} className="text-white hover:underline">
          {EMAIL_CONTACT}
        </a>
      </p>

      <div className="mt-3 text-xs">
        <Link to="/mentions-legales">Mentions légales</Link>
      </div>

      <Bouton
        variante="discret"
        taille="nu"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        Retour en haut
      </Bouton>
    </div>
  </footer>
);