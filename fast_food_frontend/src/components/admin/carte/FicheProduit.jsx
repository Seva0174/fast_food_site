import { useId, useRef, useState } from 'react';
import { ModalShell } from '@/components/modales/ModalShell';
import { Bouton } from '@/components/ui/bouton';
import { ListeOnglets, Onglets, PanneauOnglet } from '@/components/ui/onglets';
import {
  CONFIRMER_ABANDON,
  ContexteEditions,
  useEditionsEnCours,
} from '@/hooks/useEditionsEnCours';
import { useEnvoi } from '@/hooks/useEnvoi';
import {
  FORMULAIRE_PRODUIT_VIDE,
  SAISIE_INGREDIENT_VIDE,
  ajouterIngredient,
  categorieParDefaut,
  categoriesProposees,
  construirePayloadProduit,
  erreurIngredient,
  erreursProduit,
  estProduitFormule,
  formulaireDepuisProduit,
  raisonBlocage,
  recetteDepuisProduit,
  verifierMiseEnVente,
} from '@/lib/carte';
import { EditeurRecette } from './EditeurRecette';
import { OngletComposition } from './OngletComposition';
import { OngletDetails } from './OngletDetails';
import { OngletOptions } from './OngletOptions';

// Fiche d'un produit : tout se règle ici, en onglets.
// - Détails et Recette (produit simple) se saisissent ensemble et s'enregistrent avec le bouton du pied.
// - Options (produit simple) ou Composition (menu) s'enregistrent au fil de l'eau, comme avant.
// À la création, le produit est enregistré d'abord (onglet Détails) ; la fiche reste ouverte et passe
// aux options ou à la composition. Fermer avec des changements non enregistrés demande confirmation.
// idProduit nul : nouveau produit. onEnregistrer(produit, payload) renvoie false en cas d'échec,
// sinon le produit créé (à la création) ou true.
export const FicheProduit = ({
  idProduit: idInitial,
  ongletInitial = 'details',
  produits,
  categories,
  matieresPremieres,
  onEnregistrer,
  onRefresh,
  onClose,
}) => {
  const id = useId();
  const [idProduit, setIdProduit] = useState(idInitial);
  const produit = idProduit ? (produits.find((p) => p.id === idProduit) ?? null) : null;

  const [depart] = useState(() => ({
    formulaire: produit
      ? formulaireDepuisProduit(produit)
      : { ...FORMULAIRE_PRODUIT_VIDE, idCategorie: categorieParDefaut(categories) },
    recette: produit ? recetteDepuisProduit(produit) : [],
  }));
  const [formulaire, setFormulaire] = useState(depart.formulaire);
  const [recette, setRecette] = useState(depart.recette);
  const [saisieIngredient, setSaisieIngredient] = useState(SAISIE_INGREDIENT_VIDE);
  // État enregistré, pour savoir si quelque chose a été modifié
  const [reference, setReference] = useState(() => JSON.stringify(depart));
  const [erreurs, setErreurs] = useState({});
  const [refusVente, setRefusVente] = useState('');
  // Adresse d'image qui n'a pas pu être chargée
  const [imageEnEchec, setImageEnEchec] = useState(null);
  const [onglet, setOnglet] = useState(ongletInitial);
  // Les onglets Options et Composition ne se chargent qu'à leur première ouverture, puis restent montés
  const [visites, setVisites] = useState(() => new Set([ongletInitial]));
  const { enCours: envoiEnCours, lancer } = useEnvoi();
  const { enCours: editionEnCours, editionOuverte, contexte } = useEditionsEnCours();
  const champNom = useRef(null);
  const champPrix = useRef(null);

  const estFormule = estProduitFormule(categories, produit, formulaire.idCategorie);
  const categoriesAffichees = categoriesProposees(categories, produit, formulaire.idCategorie);
  const modifie = JSON.stringify({ formulaire, recette }) !== reference || saisieIngredient.idMatiere !== '';

  const idOngletSuite = estFormule ? 'composition' : 'options';
  const onglets = [
    { id: 'details', libelle: 'Détails' },
    ...(estFormule ? [] : [{ id: 'recette', libelle: 'Recette' }]),
    // Alerte : la configuration enregistrée empêche de commander ce produit
    { id: idOngletSuite, libelle: estFormule ? 'Composition' : 'Options', alerte: Boolean(produit && raisonBlocage(produit)) },
  ];
  // Changer la catégorie d'un nouveau produit peut faire disparaître l'onglet affiché
  const ongletActif = onglets.some((o) => o.id === onglet) ? onglet : 'details';

  const aller = (idOnglet) => {
    setOnglet(idOnglet);
    setVisites((precedentes) => (precedentes.has(idOnglet) ? precedentes : new Set(precedentes).add(idOnglet)));
  };

  // Efface l'erreur d'un champ dès qu'on le modifie
  const changer = (champ, valeur) => {
    setFormulaire((prev) => ({ ...prev, [champ]: valeur }));
    if (erreurs[champ]) setErreurs((prev) => ({ ...prev, [champ]: undefined }));
    // Photo ou description saisie : le refus de mise en vente n'a peut-être plus lieu d'être
    if (champ === 'imageUrl' || champ === 'description') setRefusVente('');
  };
  const modifier = (champ) => (e) => changer(champ, e.target.value);

  // Le produit tel qu'il serait mis en vente : sa configuration enregistrée, avec la photo et la description saisies
  const raisonRefusVente = () => {
    const base = produit ?? { estFormule, groupesFormule: [], groupesOptions: [], recette: [] };
    const verdict = verifierMiseEnVente({
      ...base,
      imageUrl: formulaire.imageUrl.trim(),
      description: formulaire.description.trim(),
    });
    return verdict.ok ? '' : verdict.raison;
  };

  // Un produit déjà en vente peut être modifié, même mal configuré : le refus ne vaut que pour une mise en vente
  const changerVente = (enVente) => {
    if (enVente && !produit?.estDispo) {
      const raison = raisonRefusVente();
      if (raison) return setRefusVente(raison);
    }
    setRefusVente('');
    changer('estDispo', enVente);
  };

  // Un ingrédient choisi mais pas encore ajouté est ajouté à l'enregistrement plutôt que perdu.
  // Renvoie la recette à enregistrer, ou null si sa quantité est invalide.
  const recetteAEnregistrer = () => {
    if (estFormule || !saisieIngredient.idMatiere) return recette;
    const matiere = matieresPremieres.find((m) => String(m.id) === saisieIngredient.idMatiere);
    const quantite = parseFloat(saisieIngredient.quantite);
    const messageErreur = erreurIngredient(matiere, quantite);
    if (messageErreur) {
      setSaisieIngredient({ ...saisieIngredient, erreur: messageErreur });
      return null;
    }
    const complete = ajouterIngredient(recette, matiere, quantite);
    setRecette(complete);
    setSaisieIngredient(SAISIE_INGREDIENT_VIDE);
    return complete;
  };

  // Va sur l'onglet Détails puis place le focus (le champ n'est visible qu'une fois l'onglet affiché)
  const focaliser = (idChamp) => {
    aller('details');
    requestAnimationFrame(() => document.getElementById(idChamp)?.focus());
  };

  const soumettre = async (e) => {
    e?.preventDefault();
    const payload = construirePayloadProduit(formulaire, estFormule, recette);
    const nouvelles = erreursProduit(payload) ?? {};
    setErreurs(nouvelles);
    if (nouvelles.nom) return focaliser(`${id}-nom`);
    if (nouvelles.idCategorie) return focaliser(`${id}-categorie`);
    if (nouvelles.prix) return focaliser(`${id}-prix`);

    if (formulaire.estDispo && !produit?.estDispo) {
      const raison = raisonRefusVente();
      if (raison) {
        setRefusVente(raison);
        return focaliser(`${id}-nom`);
      }
    }

    const recetteFinale = recetteAEnregistrer();
    if (!recetteFinale) return aller('recette');
    payload.recette = construirePayloadProduit(formulaire, estFormule, recetteFinale).recette;

    const resultat = await lancer(() => onEnregistrer(produit, payload));
    if (!resultat) return;
    setReference(JSON.stringify({ formulaire, recette: recetteFinale }));
    // Création : la fiche continue sur ce produit, avec ses options ou sa composition
    if (!produit && resultat.id) {
      setIdProduit(resultat.id);
      aller(idOngletSuite);
    }
  };

  const proposerCreation = (
    <div className="mx-auto max-w-xl space-y-3 rounded-lg border border-dashed border-border p-6 text-center">
      <p className="text-sm text-muted-foreground">
        {estFormule
          ? 'Enregistrez d\'abord le menu : vous pourrez ensuite composer ses emplacements ici.'
          : "Enregistrez d'abord le produit : vous pourrez ensuite régler ses options ici."}
      </p>
      <Bouton taille="sm" disabled={envoiEnCours} onClick={() => soumettre()}>
        {envoiEnCours ? 'Enregistrement…' : 'Créer le produit'}
      </Bouton>
    </div>
  );

  const confirmerFermeture = modifie || editionEnCours ? CONFIRMER_ABANDON : null;

  return (
    <ContexteEditions.Provider value={contexte}>
      <Onglets actif={ongletActif} onChange={aller}>
        <ModalShell
          titre={produit ? produit.nom : 'Nouveau produit'}
          sousTitre={produit?.categorie?.nom}
          largeur="max-w-4xl"
          hauteur="h-[44rem]"
          onClose={onClose}
          confirmerFermeture={confirmerFermeture}
          enTete={
            <>
              {/* Visible pendant une édition : explique pourquoi les autres boutons attendent */}
              {editionOuverte && (
                <p id={contexte.idNote} className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                  Une modification est en cours : enregistrez-la ou annulez-la pour en commencer une autre.
                </p>
              )}
              <ListeOnglets variante="fiche" onglets={onglets} label="Fiche du produit" />
            </>
          }
          actions={(fermer) => (
            <>
              <Bouton variante="secondaire" taille="sm" onClick={fermer}>
                {!idProduit || modifie ? 'Annuler' : 'Fermer'}
              </Bouton>
              {(!idProduit || modifie) && (
                <Bouton taille="sm" disabled={envoiEnCours} onClick={() => soumettre()}>
                  {envoiEnCours ? 'Enregistrement…' : idProduit ? 'Enregistrer' : 'Créer le produit'}
                </Bouton>
              )}
            </>
          )}
        >
          <PanneauOnglet id="details" garderMonte>
            <form onSubmit={soumettre} noValidate>
              <OngletDetails
                id={id}
                formulaire={formulaire}
                erreurs={erreurs}
                produit={produit}
                estFormule={estFormule}
                categories={categoriesAffichees}
                refusVente={refusVente}
                imageEnEchec={imageEnEchec}
                champNom={champNom}
                champPrix={champPrix}
                onChanger={changer}
                onModifier={modifier}
                onChangerVente={changerVente}
                onImageEnEchec={setImageEnEchec}
              />
            </form>
          </PanneauOnglet>

          {!estFormule && (
            <PanneauOnglet id="recette" garderMonte>
              <div className="mx-auto max-w-xl">
                <EditeurRecette
                  recette={recette}
                  matieresPremieres={matieresPremieres}
                  onChange={setRecette}
                  saisie={saisieIngredient}
                  onSaisie={setSaisieIngredient}
                />
              </div>
            </PanneauOnglet>
          )}

          {!estFormule && (
            <PanneauOnglet id="options" garderMonte>
              {visites.has('options') &&
                (produit ? (
                  <OngletOptions produit={produit} matieresPremieres={matieresPremieres} onRefresh={onRefresh} />
                ) : (
                  proposerCreation
                ))}
            </PanneauOnglet>
          )}

          {estFormule && (
            <PanneauOnglet id="composition" garderMonte>
              {visites.has('composition') &&
                (produit ? (
                  <OngletComposition formule={produit} produits={produits} onRefresh={onRefresh} />
                ) : (
                  proposerCreation
                ))}
            </PanneauOnglet>
          )}
        </ModalShell>
      </Onglets>
    </ContexteEditions.Provider>
  );
};
