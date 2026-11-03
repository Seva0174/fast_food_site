import { AlertCircle, Plus } from 'lucide-react';
import { EnTeteGroupe } from '@/components/admin/groupes/EnTeteGroupe';
import { Bouton } from '@/components/ui/bouton';
import { useEditionExclusive } from '@/hooks/useEditionsEnCours';
import { grouperParCategorie, manqueEmplacement, produitsAjoutables } from '@/lib/formule';
import { FormulaireProduitFormule } from './FormulaireProduitFormule';
import { LienProduitFormule } from './LienProduitFormule';

// Un emplacement de menu : en-tête, avertissements, produits proposés et ajout d'un produit.
// onRetirerProduit reçoit le lien (la confirmation est demandée par la modale).
export const CarteEmplacement = ({
  id,
  groupe,
  position,
  premier,
  dernier,
  onDeplacer,
  produits,
  onModifierGroupe,
  onSupprimerGroupe,
  onAjouterProduit,
  onModifierSurcout,
  onRetirerProduit,
}) => {
  const { ouverte: ajoutOuvert, ailleurs, ouvrir, fermer, attente } = useEditionExclusive();
  const ajoutables = produitsAjoutables(produits, groupe);

  return (
    // tabIndex -1 : le résumé des emplacements incomplets peut y amener le focus
    <section id={id} tabIndex={-1} className="scroll-mt-4 overflow-hidden rounded-xl border border-border bg-card outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <div className="border-b border-border bg-muted/50 px-4 py-3">
        <EnTeteGroupe
          groupe={groupe}
          avecOrdre
          position={position}
          premier={premier}
          dernier={dernier}
          onDeplacer={onDeplacer}
          onModifier={onModifierGroupe}
          onSupprimer={onSupprimerGroupe}
        />
      </div>

      <div className="space-y-3 p-4">
        {/* Une ligne : le détail et la liste des emplacements à corriger sont dans le résumé en haut */}
        {manqueEmplacement(groupe) && (
          <p className="flex items-center gap-2 text-sm font-medium text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {manqueEmplacement(groupe)} : le menu ne peut pas être commandé.
          </p>
        )}

        {groupe.produits.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun produit dans cet emplacement pour le moment.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {groupe.produits.map((lien) => (
              <LienProduitFormule
                key={lien.id}
                lien={lien}
                onModifierSurcout={onModifierSurcout}
                nomEmplacement={groupe.nom}
                onRetirer={() => onRetirerProduit(lien)}
              />
            ))}
          </ul>
        )}

        {ajoutOuvert ? (
          <FormulaireProduitFormule
            categories={grouperParCategorie(ajoutables)}
            titre={`Proposer un produit dans « ${groupe.nom} »`}
            onSoumettre={(formulaire) => onAjouterProduit(groupe.id, formulaire)}
            onAnnuler={fermer}
          />
        ) : ajoutables.length > 0 ? (
          <Bouton
            variante="fantome"
            taille="sm"
            className="-ml-2"
            {...attente(ailleurs)}
            onClick={() => !ailleurs && ouvrir()}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Proposer un produit
          </Bouton>
        ) : (
          <p className="text-sm text-muted-foreground">Tous les produits de la carte sont déjà proposés ici.</p>
        )}
      </div>
    </section>
  );
};
