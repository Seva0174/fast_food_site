import { Bouton } from '../ui/bouton';
import { ModalShell } from './ModalShell';
import { GroupeOptions } from './GroupeOptions';
import { useSelectionOptions } from '../../hooks/useSelectionOptions';

export const ProductOptionModal = ({ produit, itemPanier, isOpen, onClose, onConfirm }) => {
  const groupes = produit?.groupesOptions ?? [];
  const { selections, erreurs, choisir, verifier, optionIds, surcout } = useSelectionOptions(
    groupes,
    itemPanier
  );

  if (!isOpen || !produit) return null;

  const confirmer = () => {
    if (verifier()) onConfirm(produit, optionIds);
  };

  return (
    <ModalShell
      titre={produit.nom}
      sousTitre="Personnalisez votre commande"
      onClose={onClose}
      prixTotal={Number(produit.prix ?? 0) + surcout}
      actions={
        <Bouton taille="lg" onClick={confirmer}>
          {itemPanier ? 'Enregistrer les modifications' : 'Ajouter au panier'}
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