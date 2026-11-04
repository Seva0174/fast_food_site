import { Interrupteur } from '@/components/ui/interrupteur';
import { ListeDeroulante } from '@/components/ui/liste';
import { attributsErreur, classeChamp, classeLabel, classeListe, classeZoneTexte } from './classes';
import { ErreurChamp } from './ErreurChamp';
import { ImageProduit } from './ImageProduit';

// Onglet « Détails » de la fiche d'un produit : nom, catégorie, prix, mise en vente, image, description.
// Les erreurs de saisie s'affichent sous leur champ. refusVente : raison pour laquelle le produit ne peut
// pas être mis en vente, affichée sous l'interrupteur.
export const OngletDetails = ({
  id,
  formulaire,
  erreurs,
  produit,
  estFormule,
  categories,
  refusVente,
  imageEnEchec,
  champNom,
  champPrix,
  onChanger,
  onModifier,
  onChangerVente,
  onImageEnEchec,
}) => {
  const urlImage = formulaire.imageUrl.trim();
  const proprietesErreur = (champ) => attributsErreur(erreurs, champ, id);

  return (
    <section className="mx-auto max-w-xl space-y-4" aria-labelledby={`${id}-titre-details`}>
      <h3 id={`${id}-titre-details`} className="sr-only">
        Détails du produit
      </h3>

      <div>
        <label htmlFor={`${id}-nom`} className={classeLabel}>
          Nom
        </label>
        <input
          id={`${id}-nom`}
          ref={champNom}
          type="text"
          autoFocus={!produit}
          autoComplete="off"
          value={formulaire.nom}
          onChange={onModifier('nom')}
          className={classeChamp}
          {...proprietesErreur('nom')}
        />
        <ErreurChamp id={`${id}-erreur-nom`} message={erreurs.nom} />
      </div>

      <div>
        <label htmlFor={`${id}-categorie`} className={classeLabel}>
          Catégorie
        </label>
        <ListeDeroulante
          id={`${id}-categorie`}
          valeur={formulaire.idCategorie}
          onChange={(idCategorie) => onChanger('idCategorie', idCategorie)}
          options={categories.map((c) => ({ value: c.id, label: c.nom }))}
          placeholder="Choisir une catégorie"
          className={classeListe}
          invalide={Boolean(erreurs.idCategorie)}
          ariaDescribedby={erreurs.idCategorie ? `${id}-erreur-idCategorie` : undefined}
        />
        <ErreurChamp id={`${id}-erreur-idCategorie`} message={erreurs.idCategorie} />
        {/* Notes affichées seulement quand elles s'appliquent */}
        {produit?.estFormule && (
          <p className="mt-1 text-sm text-muted-foreground">Un menu reste dans la catégorie des menus.</p>
        )}
        {!produit && estFormule && (
          <p className="mt-1 text-sm text-muted-foreground">
            Les produits de cette catégorie sont des menus : après la création, compose-le dans l'onglet
            Composition.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 items-start gap-3">
        <div>
          <label htmlFor={`${id}-prix`} className={classeLabel}>
            {estFormule ? 'Prix de base (€)' : 'Prix (€)'}
          </label>
          <input
            id={`${id}-prix`}
            ref={champPrix}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={formulaire.prix}
            onChange={onModifier('prix')}
            className={`${classeChamp} tabular-nums`}
            {...proprietesErreur('prix')}
          />
          <ErreurChamp id={`${id}-erreur-prix`} message={erreurs.prix} />
        </div>
        <div>
          <span className={classeLabel}>Mise en vente</span>
          <Interrupteur
            actif={formulaire.estDispo}
            onChange={onChangerVente}
            aria-describedby={refusVente ? `${id}-refus-vente` : undefined}
          >
            {formulaire.estDispo ? 'En vente' : 'Hors vente'}
          </Interrupteur>
        </div>
      </div>
      {refusVente && (
        <p id={`${id}-refus-vente`} role="alert" className="-mt-2 text-sm font-medium text-destructive">
          Impossible de mettre ce produit en vente : {refusVente}
        </p>
      )}

      <div>
        <label htmlFor={`${id}-image`} className={classeLabel}>
          Adresse de l'image
        </label>
        <div className="flex items-center gap-3">
          <ImageProduit url={urlImage} alt="Aperçu de l'image" taille="size-10" onErreur={onImageEnEchec} />
          <input
            id={`${id}-image`}
            type="text"
            inputMode="url"
            placeholder="https://… ou /img/burger.jpg"
            value={formulaire.imageUrl}
            onChange={onModifier('imageUrl')}
            aria-describedby={urlImage && urlImage === imageEnEchec ? `${id}-image-echec` : undefined}
            className={classeChamp}
          />
        </div>
        {urlImage && urlImage === imageEnEchec && (
          <p id={`${id}-image-echec`} className="mt-1 text-sm text-muted-foreground">
            Aucune image trouvée à cette adresse.
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${id}-description`} className={classeLabel}>
          Description
        </label>
        <textarea
          id={`${id}-description`}
          rows="3"
          value={formulaire.description}
          onChange={onModifier('description')}
          className={classeZoneTexte}
        />
        {!urlImage && !formulaire.description.trim() && (
          <p className="mt-1 text-sm text-muted-foreground">
            Sans photo ni description, ce produit ne peut pas être mis en vente : il resterait masqué sur la carte
            client.
          </p>
        )}
      </div>
    </section>
  );
};
