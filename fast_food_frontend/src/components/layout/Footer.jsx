import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ContextePanier } from '../../context/ContextePanier';
import { EMAIL_CONTACT, NOM_SITE } from '../../lib/site';

const INFOS_LIVRAISON = 'Livraison à domicile ou click & collect, sans paiement en ligne.';

const classeLienBas =
  'inline-flex min-h-11 items-center px-1 hover:text-foreground hover:underline';

export const Footer = () => {
  const { totalArticles } = useContext(ContextePanier);
  const { pathname } = useLocation();
  // Sur mobile, les barres fixes du bas ne doivent pas recouvrir le footer :
  // barre du panier (accueil, sous lg) et barre de validation (commande, sous md)
  let sousBarreFixe = '';
  if (pathname === '/' && totalArticles > 0) sousBarreFixe = 'pb-24 lg:pb-0';
  else if (pathname === '/commander' && totalArticles > 0) sousBarreFixe = 'pb-24 md:pb-0';

  return (
    <footer className={`mt-auto border-t border-border bg-background text-muted-foreground ${sousBarreFixe}`}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 text-sm md:grid-cols-2">
          <div>
            <p className="titre-marque text-2xl text-foreground">
              Taco<span className="text-primary">Burger</span>
            </p>
            <p className="mt-2 text-pretty">Restaurant fictif, réalisé dans le cadre d’un projet de formation.</p>
            <p className="mt-2">
              Contact :{' '}
              <a href={`mailto:${EMAIL_CONTACT}`} className="text-foreground hover:text-primary hover:underline">
                {EMAIL_CONTACT}
              </a>
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">Commande</h2>
            <p className="mt-2">{INFOS_LIVRAISON}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border pt-4 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} {NOM_SITE}. Tous droits réservés.</p>

          <div className="flex items-center gap-4">
            <Link to="/mentions-legales" className={classeLienBas}>
              Mentions légales
            </Link>
            <button
              type="button"
              className={classeLienBas}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Retour en haut
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};