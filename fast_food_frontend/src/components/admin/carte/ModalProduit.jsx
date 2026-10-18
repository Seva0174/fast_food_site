import { useState } from 'react';
import { BandeauMessage } from '@/components/ui/bandeau';
import { ModalShell } from '@/components/modales/ModalShell';
import { Bouton } from '@/components/ui/bouton';
import { ListeDeroulante } from '@/components/ui/liste';
import {
  FORMULAIRE_PRODUIT_VIDE,
  categorieParDefaut,
  categoriesProposees,
  construirePayloadProduit,
  erreurProduit,
  estProduitFormule,
  formulaireDepuisProduit,
  recetteDepuisProduit,
} from '@/lib/carte';
import { EditeurRecette } from './EditeurRecette';

// Le bouton d'enregistrement est dans le pied de la modale, hors du formulaire : il le désigne par son id.
const ID_FORMULAIRE = 'formulaire-produit';

const classeChamp = 'w-full rounded border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-red-500';
const classeLabel = 'mb-1 block text-xs font-medium text-gray-700';

// Création ou modification d'un produit. `produit` est nul en création.
// message et afficher viennent de useCarteAdmin : ils affichent aussi les erreurs du serveur.
// onEnregistrer reçoit (produit, payload) et renvoie true si l'enregistrement a réussi.
export const ModalProduit = ({
  produit,
  categories,
  matieresPremieres,
  message,
  afficher,
  onEnregistrer,
  onClose,
}) => {
  const [formulaire, setFormulaire] = useState(() =>
    produit
      ? formulaireDepuisProduit(produit)
      : { ...FORMULAIRE_PRODUIT_VIDE, idCategorie: categorieParDefaut(categories) }
  );
  const [recette, setRecette] = useState(() => (produit ? recetteDepuisProduit(produit) : []));

  const estFormule = estProduitFormule(categories, produit, formulaire.idCategorie);
  const categoriesAffichees = categoriesProposees(categories, produit, formulaire.idCategorie);

  const modifier = (champ) => (e) => setFormulaire({ ...formulaire, [champ]: e.target.value });

  const soumettre = async (e) => {
    e.preventDefault();
    const payload = construirePayloadProduit(formulaire, estFormule, recette);
    const messageErreur = erreurProduit(payload);
    if (messageErreur) {
      afficher(messageErreur, 'erreur');
      return;
    }
    if (await onEnregistrer(produit, payload)) onClose();
  };

  return (
    <ModalShell
      titre={produit ? 'Modifier le produit' : 'Nouveau produit'}
      largeur="max-w-3xl"
      onClose={onClose}
      actions={
        <>
          <Bouton variante="secondaire" taille="sm" onClick={onClose}>
            Annuler
          </Bouton>
          <Bouton type="submit" form={ID_FORMULAIRE} taille="sm">
            Enregistrer
          </Bouton>
        </>
      }
    >
      <BandeauMessage message={message} />

      <form id={ID_FORMULAIRE} onSubmit={soumettre} className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Détails du produit</h4>

          <div>
            <label className={classeLabel}>Nom</label>
            <input
              type="text"
              required
              value={formulaire.nom}
              onChange={modifier('nom')}
              className={classeChamp}
            />
          </div>

          <div>
            <label className={classeLabel}>Catégorie</label>
            <ListeDeroulante
              valeur={formulaire.idCategorie}
              onChange={(idCategorie) => setFormulaire({ ...formulaire, idCategorie })}
              options={categoriesAffichees.map((c) => ({ value: c.id, label: c.nom }))}
              placeholder="Sélectionner une catégorie"
              className="w-full rounded border bg-white px-3 py-2"
            />
            {estFormule && (
              <p className="mt-1 text-[11px] text-gray-500">
                Les produits de cette catégorie sont des menus composés de plusieurs produits.
              </p>
            )}
            {produit && (
              <p className="mt-1 text-[11px] text-gray-400">
                Un menu ne peut pas être déplacé hors de cette catégorie, ni un produit simple dedans.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={classeLabel}>Prix (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formulaire.prix}
                onChange={modifier('prix')}
                className={classeChamp}
              />
            </div>
            <div className="flex items-center pt-5">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={formulaire.estDispo}
                  onChange={(e) => setFormulaire({ ...formulaire, estDispo: e.target.checked })}
                  className="rounded text-red-500 focus:ring-red-500"
                />
                Disponible
              </label>
            </div>
          </div>

          <div>
            <label className={classeLabel}>URL de l'image</label>
            <input
              type="text"
              placeholder="https://..."
              value={formulaire.imageUrl}
              onChange={modifier('imageUrl')}
              className={classeChamp}
            />
          </div>

          <div>
            <label className={classeLabel}>Description</label>
            <textarea
              rows="3"
              value={formulaire.description}
              onChange={modifier('description')}
              className={classeChamp}
            />
          </div>
        </div>

        {estFormule ? (
          <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">Menu (formule)</h4>
            <p>
              Le prix saisi est le prix de base du menu. Après l'enregistrement, utilisez le bouton
              "Composition" pour définir les emplacements (burger, accompagnement, boisson...) et les
              produits proposés dans chacun.
            </p>
            <p>
              Un menu n'a pas de recette : le stock est déduit à partir des produits choisis par le client.
            </p>
          </div>
        ) : (
          <EditeurRecette
            recette={recette}
            matieresPremieres={matieresPremieres}
            onChange={setRecette}
          />
        )}
      </form>
    </ModalShell>
  );
};