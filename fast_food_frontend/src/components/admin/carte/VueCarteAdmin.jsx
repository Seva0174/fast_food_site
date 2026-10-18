import { useState } from 'react';
import { BandeauMessage } from '@/components/ui/bandeau';
import { PanneauAdmin } from '@/components/admin/PanneauAdmin';
import { ModalConfirmation } from '@/components/modales/ModalConfirmation';
import { Bouton } from '@/components/ui/bouton';
import { useCarteAdmin } from '@/hooks/useCarteAdmin';
import { useConfirmation } from '@/hooks/useConfirmation';
import { produitsParCategorie } from '@/lib/carte';
import { GestionFormuleModal } from './GestionFormuleModal';
import { GestionOptionsModal } from './GestionOptionsModal';
import { ModalProduit } from './ModalProduit';
import { TableauCarte } from './TableauCarte';

export function VueCarteAdmin() {
  const {
    produits,
    categories,
    matieresPremieres,
    chargement,
    erreur,
    message,
    afficher,
    charger,
    enregistrer,
    changerDisponibilite,
    supprimer,
  } = useCarteAdmin();
  const { confirmer, modaleProps } = useConfirmation();

  // { produit } quand la modale de produit est ouverte (produit nul en création), sinon null
  const [modaleProduit, setModaleProduit] = useState(null);
  const [produitPourOptions, setProduitPourOptions] = useState(null);
  const [produitPourFormule, setProduitPourFormule] = useState(null);

  const demanderSuppression = async (produit) => {
    const confirme = await confirmer({
      titre: 'Supprimer le produit',
      message: `Voulez-vous vraiment supprimer le produit "${produit.nom}" ?`,
      libelleConfirmer: 'Supprimer',
    });
    if (confirme) await supprimer(produit);
  };

  return (
    <PanneauAdmin
      titre="Gestion de la Carte"
      sousTitre="Ajoutez, modifiez, désactivez les produits, configurez leurs options (viandes, sauces, etc.) ou la composition des menus."
      actions={
        <Bouton taille="sm" onClick={() => setModaleProduit({ produit: null })}>
          + Ajouter un produit
        </Bouton>
      }
    >
      <BandeauMessage message={message} />

      {chargement && <p className="text-gray-500">Chargement de la carte...</p>}
      {erreur && <p className="font-medium text-red-500">{erreur}</p>}

      {!chargement && !erreur && (
        <TableauCarte
          groupes={produitsParCategorie(categories, produits)}
          onChangerDisponibilite={changerDisponibilite}
          onGererComposition={setProduitPourFormule}
          onGererOptions={setProduitPourOptions}
          onModifier={(produit) => setModaleProduit({ produit })}
          onSupprimer={demanderSuppression}
        />
      )}

      {produitPourOptions && (
        <GestionOptionsModal
          produit={produitPourOptions}
          matieresPremieres={matieresPremieres}
          onClose={() => setProduitPourOptions(null)}
          onRefresh={charger}
        />
      )}

      {produitPourFormule && (
        <GestionFormuleModal
          formule={produitPourFormule}
          produits={produits}
          onClose={() => setProduitPourFormule(null)}
          onRefresh={charger}
        />
      )}

      {modaleProduit && (
        <ModalProduit
          key={modaleProduit.produit?.id ?? 'nouveau'}
          produit={modaleProduit.produit}
          categories={categories}
          matieresPremieres={matieresPremieres}
          message={message}
          afficher={afficher}
          onEnregistrer={enregistrer}
          onClose={() => setModaleProduit(null)}
        />
      )}

      <ModalConfirmation {...modaleProps} />
    </PanneauAdmin>
  );
}