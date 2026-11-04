import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { History, Package, RefreshCw, RotateCcw } from 'lucide-react';
import { AuthContext } from '../context/AuthProvider';
import { ContextePanier } from '../context/ContextePanier';
import { useMesCommandes } from '../hooks/useMesCommandes';
import { useCarte } from '../hooks/useCarte';
import { libelleRecommande, preparerRecommande } from '../lib/recommande';
import { CommandeDetailModal } from '../components/commande/CommandeDetailModal';
import { CarteCommandeClient } from '../components/commande/CarteCommandeClient';
import { AdresseParDefaut } from '../components/compte/AdresseParDefaut';
import { Bouton } from '../components/ui/bouton';
import { estEnCours, estTerminee, ordonnerCommandesClient } from '../lib/commande';
import { useTitrePage } from '@/hooks/useTitrePage';

const ONGLETS = [
  { id: 'encours', libelle: 'En cours', icone: Package, vide: 'Aucune commande en cours.' },
  { id: 'historique', libelle: 'Historique', icone: History, vide: 'Aucune commande passée pour le moment.' },
];

const CommandesEnChargement = () => (
  <div role="status" className="space-y-4">
    <span className="sr-only">Chargement de tes commandes…</span>
    {[0, 1].map((i) => (
      <div key={i} className="squelette h-36 rounded-2xl" aria-hidden="true" />
    ))}
  </div>
);

const CommandesEnErreur = ({ message, onReessayer }) => (
  <div role="alert" className="rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-center">
    <p className="font-semibold">{message}</p>
    <p className="mt-1 text-sm text-muted-foreground">
      Elles ne sont pas perdues : réessaie dans un instant.
    </p>
    <Bouton variante="secondaire" className="mt-4" onClick={onReessayer}>
      <RotateCcw className="h-4 w-4" aria-hidden="true" />
      Réessayer
    </Bouton>
  </div>
);

const CommandesVides = ({ message }) => (
  <div className="rounded-2xl border border-border bg-card p-8 text-center">
    <p className="text-muted-foreground">{message}</p>
    <Link
      to="/"
      className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
    >
      Voir la carte
    </Link>
  </div>
);

export const PageUser = () => {
  useTitrePage('Mon compte');
  const { user } = useContext(AuthContext);
  const { commandes, chargement, erreur, charger } = useMesCommandes();
  const { produits } = useCarte();
  const { recommander } = useContext(ContextePanier);
  const navigate = useNavigate();
  const [parametres, setParametres] = useSearchParams();
  const [commandeOuverte, setCommandeOuverte] = useState(null);
  const [ongletChoisi, setOngletChoisi] = useState(null);
  // Id de la commande en cours de recommande (desactive son bouton pendant l'ajout)
  const [recommandeEnCours, setRecommandeEnCours] = useState(null);
  const refPanneau = useRef(null);

  // Commande a mettre en avant : lien "Suivre ma commande" du ticket (/user?commande=23).
  // Lue une seule fois puis retiree de l'URL : un rechargement ne la remet pas en avant.
  const [idEnAvant] = useState(() => Number(parametres.get('commande')) || null);
  const commandeEnAvant = commandes.find((c) => c.id === idEnAvant);
  const refEnAvant = useRef(null);

  useEffect(() => {
    if (parametres.has('commande')) setParametres({}, { replace: true });
  }, [parametres, setParametres]);

  const commandesEnCours = ordonnerCommandesClient(commandes.filter(estEnCours), idEnAvant);
  const commandesPassees = ordonnerCommandesClient(commandes.filter(estTerminee), idEnAvant);

  // Onglet par defaut : celui de la commande mise en avant, sinon "En cours"
  const ongletParDefaut = commandeEnAvant && estTerminee(commandeEnAvant) ? 'historique' : 'encours';
  const onglet = ongletChoisi ?? ongletParDefaut;
  const listeAffichee = onglet === 'encours' ? commandesEnCours : commandesPassees;
  const compteurs = { encours: commandesEnCours.length, historique: commandesPassees.length };

  // La commande mise en avant est en tete de liste : on ne fait defiler que si elle est
  // hors de l'ecran, pour garder le titre et les onglets visibles.
  useEffect(() => {
    const carte = refEnAvant.current;
    if (chargement || !commandeEnAvant || !carte) return;
    const { top, bottom } = carte.getBoundingClientRect();
    if (top < 80 || bottom > window.innerHeight) carte.scrollIntoView({ block: 'center' });
  }, [chargement, commandeEnAvant]);

  // Le focus suit le rechargement : sinon il retombe en haut de la page
  const reessayer = () => {
    charger();
    refPanneau.current?.focus();
  };

  // Ce qu'une commande terminee permet de recommander, calcule une fois par commande :
  // la carte et la modale annoncent avant le clic ce qui sera vraiment repris.
  const recommandes = useMemo(
    () =>
      Object.fromEntries(
        commandes.filter(estTerminee).map((c) => [c.id, preparerRecommande(c, produits)])
      ),
    [commandes, produits]
  );

  // "Recommander" : reprend les articles encore disponibles, puis va droit a la validation
  const recommanderCommande = async (commande) => {
    const preparation = recommandes[commande.id];
    if (!preparation || preparation.articles.length === 0) return;
    setRecommandeEnCours(commande.id);
    const ajoutes = await recommander(preparation.articles, preparation.indisponibles);
    setRecommandeEnCours(null);
    if (ajoutes > 0) {
      setCommandeOuverte(null);
      navigate('/commander');
    }
  };

  const recommandeOuverte = commandeOuverte ? recommandes[commandeOuverte.id] : null;

  // Onglets : fleches gauche/droite pour passer de l'un a l'autre
  const surToucheOnglets = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const suivant = onglet === 'encours' ? 'historique' : 'encours';
    setOngletChoisi(suivant);
    document.getElementById(`onglet-${suivant}`)?.focus();
  };

  const ongletCourant = ONGLETS.find((o) => o.id === onglet);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="titre-marque text-5xl sm:text-6xl">Mon compte</h1>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8">
        {/* Les commandes passent en premier : c'est le contenu vivant de la page */}
        <section aria-labelledby="titre-commandes" className="lg:col-span-2">
          <h2 id="titre-commandes" className="titre-marque text-3xl">
            Mes commandes
          </h2>

          <div
            role="tablist"
            aria-label="Mes commandes"
            onKeyDown={surToucheOnglets}
            className="mt-3 flex gap-1 border-b border-border"
          >
            {ONGLETS.map(({ id, libelle, icone: Icone }) => {
              const actif = onglet === id;
              return (
                <button
                  key={id}
                  id={`onglet-${id}`}
                  type="button"
                  role="tab"
                  aria-selected={actif}
                  aria-controls="panneau-commandes"
                  tabIndex={actif ? 0 : -1}
                  onClick={() => setOngletChoisi(id)}
                  className={`-mb-px inline-flex min-h-11 items-center gap-2 border-b-2 px-3 text-sm font-semibold transition-colors ${
                    actif
                      ? 'border-foreground text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icone className="h-4 w-4" aria-hidden="true" />
                  {libelle}
                  {!chargement && !erreur && (
                    <span className="tabular-nums text-muted-foreground">({compteurs[id]})</span>
                  )}
                </button>
              );
            })}
          </div>

          <div
            id="panneau-commandes"
            ref={refPanneau}
            tabIndex={-1}
            role="tabpanel"
            aria-labelledby={`onglet-${onglet}`}
            className="mt-4 space-y-4 outline-none"
          >
            {chargement && <CommandesEnChargement />}
            {!chargement && erreur && <CommandesEnErreur message={erreur} onReessayer={reessayer} />}
            {!chargement && !erreur && listeAffichee.length === 0 && (
              <CommandesVides message={ongletCourant.vide} />
            )}
            {!chargement &&
              !erreur &&
              listeAffichee.map((commande) => (
                <CarteCommandeClient
                  key={commande.id}
                  ref={commande.id === idEnAvant ? refEnAvant : undefined}
                  commande={commande}
                  enAvant={commande.id === idEnAvant}
                  onDetails={() => setCommandeOuverte(commande)}
                  recommande={recommandes[commande.id]}
                  onRecommander={() => recommanderCommande(commande)}
                  recommandeEnCours={recommandeEnCours === commande.id}
                />
              ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="titre-marque text-2xl">Mes informations</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Nom</dt>
                <dd className="font-semibold">{user?.nom || 'Non renseigné'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">E-mail</dt>
                <dd className="break-all font-semibold">{user?.email}</dd>
              </div>
            </dl>
          </section>

          <AdresseParDefaut key={user?.id} idUser={user?.id} />
        </aside>
      </div>

      <CommandeDetailModal
        commande={commandeOuverte}
        onClose={() => setCommandeOuverte(null)}
        suivi
        raisonsIndisponibles={recommandeOuverte?.raisonsIndisponibles}
        // Une commande en cours se suit, elle ne se recommande pas (evite les doublons)
        actions={
          !recommandeOuverte ? undefined : recommandeOuverte.articles.length === 0 ? (
            // Rien a reprendre : une phrase, pas un bouton desactive habille comme une action.
            // ! : le pied de ModalShell empeche ses enfants de passer a la ligne et de retrecir (boutons)
            <p className="min-w-0 whitespace-normal! text-sm text-muted-foreground sm:flex-1!">
              Aucun article ne peut être recommandé tel quel : recompose ta commande depuis la carte.
            </p>
          ) : (
            <Bouton
              taille="lg"
              onClick={() => recommanderCommande(commandeOuverte)}
              disabled={recommandeEnCours !== null}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {recommandeEnCours === commandeOuverte.id
                ? 'Ajout au panier…'
                : libelleRecommande(recommandeOuverte)}
            </Bouton>
          )
        }
      />
    </div>
  );
};
