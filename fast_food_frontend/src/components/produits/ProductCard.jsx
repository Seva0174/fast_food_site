import { useContext, useEffect, useState } from 'react';
import { Check, ShoppingBag } from 'lucide-react';
import { ContextePanier } from '../../context/ContextePanier';
import { Bouton } from '../ui/bouton';
import { Badge } from '../ui/badge';
import { estPersonnalisable, estDisponible, aDesOptions } from '../../lib/produit';
import { formaterPrix } from '../../lib/prix';

// Un seul verbe sur toutes les cartes : « Ajouter ». Un produit a options l'annonce a cote du prix
// (un menu porte deja son badge « Menu ») ; le bouton ouvre alors la modale de choix.
const indicationChoix = (produit) => (!produit.estFormule && aDesOptions(produit) ? 'Au choix' : null);

export const ProductCard = ({ produit, onOpenModal }) => {
  const { ajouterAuPanier } = useContext(ContextePanier);

  const disponible = estDisponible(produit);
  const personnalisable = estPersonnalisable(produit);
  const choix = indicationChoix(produit);

  // 'envoi' pendant la requete (empeche le double ajout), puis 'ajoute' un court instant
  const [etatAjout, setEtatAjout] = useState(null);
  useEffect(() => {
    if (etatAjout !== 'ajoute') return undefined;
    const minuterie = setTimeout(() => setEtatAjout(null), 1400);
    return () => clearTimeout(minuterie);
  }, [etatAjout]);

  const handleClick = async () => {
    if (personnalisable) {
      onOpenModal?.(produit);
      return;
    }
    setEtatAjout('envoi');
    const ajoute = await ajouterAuPanier(produit, []);
    setEtatAjout(ajoute ? 'ajoute' : null);
  };

  const estAjoute = etatAjout === 'ajoute';

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
        {produit.imageUrl && (
          <img
            src={produit.imageUrl}
            alt={produit.nom}
            loading="lazy"
            className={`h-full w-full object-cover ${disponible ? '' : 'grayscale'}`}
          />
        )}

        {produit.estFormule && (
          <Badge variante="discret" className="absolute left-2 top-2 px-2.5 py-1">
            Menu
          </Badge>
        )}

        {!disponible && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 font-semibold text-foreground">
            {produit.estDispo ? 'Indisponible' : 'Épuisé'}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="titre-marque text-2xl">{produit.nom}</h3>
        <p className="mt-1 line-clamp-2 text-pretty text-sm text-muted-foreground">{produit.description}</p>

        <div className="mt-auto space-y-3 pt-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xl font-bold tabular-nums">{formaterPrix(produit.prix)}</span>
            {choix && <span className="text-xs text-muted-foreground">{choix}</span>}
          </div>

          <Bouton
            taille="sm"
            variante={estAjoute ? 'contour' : 'principal'}
            className="min-h-11 w-full lg:min-h-9"
            onClick={handleClick}
            disabled={!disponible || etatAjout === 'envoi'}
            aria-label={estAjoute ? `${produit.nom} ajouté au panier` : `Ajouter : ${produit.nom}`}
            aria-haspopup={personnalisable ? 'dialog' : undefined}
          >
            {estAjoute ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{estAjoute ? 'Ajouté' : 'Ajouter'}</span>
          </Bouton>
        </div>
      </div>
    </article>
  );
};