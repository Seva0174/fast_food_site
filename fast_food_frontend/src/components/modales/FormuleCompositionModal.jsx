import { Bouton } from '../ui/bouton';
import { ModalShell } from './ModalShell';
import { ChoixOption, Surcout } from './ChoixOption';
import { GroupeOptions } from './GroupeOptions';
import { useAssemblageMenu } from '../../hooks/useAssemblageMenu';
import { choixDuGroupe } from '../../lib/formule';
import { decrireRegle } from '../../lib/options';

const BarreProgression = ({ valeur }) => (
  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200">
    <div
      className="h-full bg-red-600 transition-all duration-300"
      style={{ width: `${valeur * 100}%` }}
    />
  </div>
);

// Etape : choix du produit pour un emplacement du menu
const EtapeEmplacement = ({ groupe, choisis, onChoisir }) => {
  const rond = groupe.maxSelection === 1;

  return (
    <>
      <div>
        <h4 className="font-bold text-gray-900">{groupe.nom}</h4>
        <p className="text-xs text-gray-500">{decrireRegle(groupe)}</p>
      </div>

      <div className="space-y-2">
        {groupe.produits.map((lien) => {
          const estCoche = choisis.some((c) => c.idProduit === lien.idProduit);
          const indisponible = !lien.estDispo;
          const maxAtteint = !rond && !estCoche && choisis.length >= groupe.maxSelection;

          return (
            <ChoixOption
              key={lien.id}
              libelle={lien.nomProduit}
              image={lien.imageUrl}
              actif={estCoche}
              radio={rond}
              desactive={indisponible || maxAtteint}
              onClick={() => onChoisir(groupe, lien)}
              droite={
                indisponible ? (
                  <span className="shrink-0 text-xs font-bold text-gray-500">Épuisé</span>
                ) : (
                  <Surcout valeur={lien.surcout} />
                )
              }
            />
          );
        })}
      </div>
    </>
  );
};

// Etape : options du produit choisi pour l'emplacement
const EtapeOptions = ({ etape, onChoisirOption }) => (
  <>
    <div>
      <h4 className="font-bold text-gray-900">Personnalisez : {etape.produit.nom}</h4>
      <p className="text-xs text-gray-500">{etape.groupe.nom}</p>
    </div>

    {(etape.produit.groupesOptions ?? []).map((groupeOption) => (
      <GroupeOptions
        key={groupeOption.id}
        groupe={groupeOption}
        choisis={etape.choix.optionIds}
        onChoisir={(gOpt, idItem) => onChoisirOption(gOpt, idItem)}
      />
    ))}
  </>
);

export const FormuleCompositionModal = ({
  formule,
  produits = [],
  itemPanier,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const assemblage = useAssemblageMenu({ formule, produits, itemPanier });

  if (!isOpen || !formule) return null;

  const {
    etapes,
    etape,
    indexCourant,
    estDerniereEtape,
    selections,
    erreur,
    prixTotal,
    choisirProduit,
    choisirOption,
    suivant,
    precedent,
    valider,
  } = assemblage;

  const confirmer = () => {
    const choixFormule = valider();
    if (choixFormule) onConfirm(formule, choixFormule);
  };

  const libelleConfirmation = itemPanier ? 'Enregistrer les modifications' : 'Ajouter au panier';

  return (
    <ModalShell
      titre={formule.nom}
      sousTitre={`Composez votre menu${
        etapes.length > 0 ? ` - étape ${indexCourant + 1} sur ${etapes.length}` : ''
      }`}
      onClose={onClose}
      prixLibelle="Total du menu"
      prixTotal={prixTotal}
      enTete={etapes.length > 0 && <BarreProgression valeur={(indexCourant + 1) / etapes.length} />}
      actions={
        etape && (
          <>
            {indexCourant > 0 && (
              <Bouton variante="secondaire" taille="lg" onClick={precedent}>
                Précédent
              </Bouton>
            )}
            {estDerniereEtape ? (
              <Bouton taille="lg" onClick={confirmer}>
                {libelleConfirmation}
              </Bouton>
            ) : (
              <Bouton taille="lg" onClick={suivant}>
                Suivant
              </Bouton>
            )}
          </>
        )
      }
    >
      {!etape && (
        <p className="py-6 text-center text-sm text-gray-500">
          Ce menu n'est pas encore configuré.
        </p>
      )}

      {etape?.type === 'groupe' && (
        <EtapeEmplacement
          groupe={etape.groupe}
          choisis={choixDuGroupe(selections, etape.groupe)}
          onChoisir={choisirProduit}
        />
      )}

      {etape?.type === 'options' && (
        <EtapeOptions
          etape={etape}
          onChoisirOption={(gOpt, idItem) =>
            choisirOption(etape.groupe, etape.choix.idProduit, gOpt, idItem)
          }
        />
      )}

      {erreur && (
        <p role="alert" className="text-xs font-semibold text-red-600">
          {erreur}
        </p>
      )}
    </ModalShell>
  );
};