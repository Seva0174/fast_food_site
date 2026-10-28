import { Link } from 'react-router-dom';
import { Bouton } from '../ui/bouton';
import { EMAIL_CONTACT } from '../../lib/site';

// A adapter avec les vraies informations du restaurant
const HORAIRES = 'Tous les jours, de 11h30 à 22h30';
const INFOS_LIVRAISON = 'Livraison à domicile et click & collect';

export const Footer = () => (
  <footer className="mt-auto border-t border-border bg-background text-muted-foreground">
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 text-sm md:grid-cols-3">
        <div>
          <p className="titre-marque text-2xl text-foreground">
            Fast<span className="text-primary">Food</span>
          </p>
          <p className="mt-2">
            Contact :{' '}
            <a href={`mailto:${EMAIL_CONTACT}`} className="text-foreground hover:text-primary hover:underline">
              {EMAIL_CONTACT}
            </a>
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-foreground">Horaires</h2>
          <p className="mt-2">{HORAIRES}</p>
        </div>

        <div>
          <h2 className="font-semibold text-foreground">Commande</h2>
          <p className="mt-2">{INFOS_LIVRAISON}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border pt-4 text-xs sm:flex-row">
        <p>© {new Date().getFullYear()} FastFood. Tous droits réservés.</p>

        <div className="flex items-center gap-4">
          <Link to="/mentions-legales" className="hover:text-foreground hover:underline">
            Mentions légales
          </Link>
          <Bouton
            variante="discret"
            taille="nu"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Retour en haut
          </Bouton>
        </div>
      </div>
    </div>
  </footer>
);