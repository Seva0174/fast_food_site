import { useMemo, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { ModalConfirmation } from '@/components/modales/ModalConfirmation';
import { Bouton } from '@/components/ui/bouton';
import { MessageFlottant } from '@/components/ui/message-flottant';
import { useCarteAdmin } from '@/hooks/useCarteAdmin';
import { useConfirmation } from '@/hooks/useConfirmation';
import {
  FILTRES_CARTE_VIDES,
  aDesFiltres,
  compterEtats,
  decrireFiltres,
  filtrerProduits,
  produitsParCategorie,
  trierProduits,
  triSuivant,
} from '@/lib/carte';
import { FicheProduit } from './FicheProduit';
import { FiltresCarte } from './FiltresCarte';
import { TableauCarte } from './TableauCarte';

export function VueCarteAdmin() {
  const {
    produits,
    categories,
    matieresPremieres,
    chargement,
    erreur,
    message,
    effacer,
    charger,
    enregistrer,
    changerDisponibilite,
    supprimer,
  } = useCarteAdmin();
  const { confirmer, modaleProps } = useConfirmation();
  const titreCarte = useRef(null);

  // Fiche ouverte : { idProduit (nul : nouveau produit), onglet }, ou null
  const [fiche, setFiche] = useState(null);
  const [filtres, setFiltres] = useState(FILTRES_CARTE_VIDES);
  // Tri à l'intérieur de chaque catégorie (null : ordre de la base)
  const [tri, setTri] = useState(null);
  // Images qui n'ont pas pu être chargées : { [idProduit]: adresse }. Elles comptent dans « À corriger ».
  const [echecsImages, setEchecsImages] = useState({});

  const groupes = useMemo(
    () => produitsParCategorie(categories, trierProduits(filtrerProduits(produits, filtres, echecsImages), tri)),
    [categories, produits, filtres, tri, echecsImages]
  );
  const nombres = compterEtats(produits, echecsImages);

  // Ouvrir la fiche efface le message précédent : il resterait affiché par-dessus
  const ouvrirFiche = (idProduit, onglet = 'details') => {
    effacer();
    setFiche({ idProduit, onglet });
  };

  const signalerImageCassee = (produit) =>
    setEchecsImages((precedents) =>
      precedents[produit.id] === produit.imageUrl ? precedents : { ...precedents, [produit.id]: produit.imageUrl }
    );

  const demanderSuppression = async (produit) => {
    const confirme = await confirmer({
      titre: produit.estFormule ? 'Supprimer le menu ?' : 'Supprimer le produit ?',
      message: produit.estFormule
        ? `Le menu « ${produit.nom} » et ses emplacements seront retirés de la carte. Cette action est irréversible. Un menu déjà commandé ne peut pas être supprimé : passez-le plutôt hors vente.`
        : `« ${produit.nom} » sera retiré de la carte avec sa recette et ses options. Cette action est irréversible. Un produit déjà commandé ou proposé dans un menu ne peut pas être supprimé : passez-le plutôt hors vente.`,
      libelleConfirmer: produit.estFormule ? 'Supprimer le menu' : 'Supprimer le produit',
      libelleRefuser: 'Garder',
      destructif: true,
    });
    if (!confirme) return;
    // La ligne a disparu : le focus revient au titre de la carte
    if (await supprimer(produit)) titreCarte.current?.focus();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 ref={titreCarte} tabIndex={-1} className="titre-marque text-3xl outline-none">
            Carte
            {!chargement && !erreur && (
              <span className="ml-3 align-middle font-sans text-base font-medium normal-case tabular-nums text-muted-foreground">
                {produits.length} produit{produits.length > 1 ? 's' : ''}
              </span>
            )}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Produits, mise en vente, options et composition des menus.
          </p>
        </div>
        <Bouton className="whitespace-nowrap" onClick={() => ouvrirFiche(null)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Ajouter un produit
        </Bouton>
      </div>

      {!chargement && !erreur && produits.length > 0 && (
        <FiltresCarte
          filtres={filtres}
          categories={categories}
          produits={produits}
          nombres={nombres}
          onChange={setFiltres}
        />
      )}

      <TableauCarte
        groupes={groupes}
        chargement={chargement}
        erreur={erreur}
        carteVide={produits.length === 0}
        filtresActifs={aDesFiltres(filtres)}
        descriptionFiltres={decrireFiltres(filtres, categories)}
        onEffacerFiltres={() => setFiltres(FILTRES_CARTE_VIDES)}
        onRecharger={charger}
        tri={tri}
        onTrier={(colonne) => setTri(triSuivant(tri, colonne))}
        echecsImages={echecsImages}
        onImageCassee={signalerImageCassee}
        onChangerDisponibilite={changerDisponibilite}
        onGererComposition={(produit) => ouvrirFiche(produit.id, 'composition')}
        onGererOptions={(produit) => ouvrirFiche(produit.id, 'options')}
        onModifier={(produit) => ouvrirFiche(produit.id)}
        onSupprimer={demanderSuppression}
      />

      {fiche && (
        <FicheProduit
          key={fiche.idProduit ?? 'nouveau'}
          idProduit={fiche.idProduit}
          ongletInitial={fiche.onglet}
          produits={produits}
          categories={categories}
          matieresPremieres={matieresPremieres}
          onEnregistrer={enregistrer}
          onRefresh={charger}
          onClose={() => setFiche(null)}
        />
      )}

      <ModalConfirmation {...modaleProps} />

      <MessageFlottant message={message} />
    </div>
  );
}
