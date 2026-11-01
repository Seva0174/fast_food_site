import { Bouton } from '../ui/bouton';
import { ModalShell } from './ModalShell';
import { GroupeOptions } from './GroupeOptions';
import { useSelectionOptions } from '../../hooks/useSelectionOptions';

export const ProductOptionModal = ({ produit, itemPanier, isOpen, onClose, onConfirm }) => {
  const groupes = produit?.groupesOptions ?? [];
  const { selections, erreurs, choisir, verifier, aDesModifications, optionIds, surcout } =
    useSelectionOptions(groupes, itemPanier);

  if (!isOpen || !produit) return null;

  const confirmer = () => {
    const groupeInvalide = verifier();
    if (!groupeInvalide) {
      onConfirm(produit, optionIds);
      return;
    }
    // Amene le premier groupe en erreur a l'ecran (il peut etre sous le bord de la modale)
    const section = document.getElementById(`section-groupe-${groupeInvalide.id}`);
    section?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    section?.querySelector('button:not([disabled])')?.focus({ preventScroll: true });
  };

  return (
    <ModalShell
      titre={produit.nom}
      sousTitre="Personnalisez votre commande"
      onClose={onClose}
      confirmerFermeture={
        aDesModifications
          ? {
              question: itemPanier ? 'Abandonner vos modifications ?' : 'Abandonner ces choix ?',
              libelleAbandon: 'Abandonner',
            }
          : null
      }
      prixTotal={Number(produit.prix ?? 0) + surcout}
      actions={
        <Bouton taille="lg" onClick={confirmer}>
          {itemPanier ? 'Enregistrer' : 'Ajouter au panier'}
        </Bouton>
      }
    >
      {groupes.map((groupe) => (
        <GroupeOptions
          key={groupe.id}
          groupe={groupe}
          choisis={selections[groupe.id] ?? []}
          erreur={erreurs[groupe.id]}
          onChoisir={choisir}
        />
      ))}
    </ModalShell>
  );
};