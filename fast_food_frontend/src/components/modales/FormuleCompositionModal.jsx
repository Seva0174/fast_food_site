import { useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { Bouton } from '../ui/bouton';
import { ModalShell } from './ModalShell';
import { ChoixOption, Surcout } from './ChoixOption';
import { GroupeOptions } from './GroupeOptions';
import { useAssemblageMenu } from '../../hooks/useAssemblageMenu';
import { choixDuGroupe, groupesOptionsEnErreur, messageGroupeOptions } from '../../lib/formule';
import { decrireRegle } from '../../lib/options';

const BarreProgression = ({ valeur }) => (
  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-accent">
    <div
      className="h-full bg-primary transition-all duration-300"
      style={{ width: `${valeur * 100}%` }}
    />
  </div>
);

// Etape : choix du produit pour un emplacement du menu
const EtapeEmplacement = ({ groupe, choisis, erreur, onChoisir }) => {
  const rond = groupe.maxSelection === 1;

  return (
    <>
      <div>
        <h3 id={`emplacement-${groupe.id}`} tabIndex={-1} className="font-bold outline-none">
          {groupe.nom}
        </h3>
        <p className="text-xs text-muted-foreground">{decrireRegle(groupe)}</p>
      </div>

      <div
        data-zone-erreur={erreur ? 'true' : undefined}
        className={`-m-2 scroll-mt-4 rounded-xl border p-2 transition-colors ${
          erreur ? 'border-destructive/60 bg-destructive/5' : 'border-transparent'
        }`}
      >
        <div
          role={rond ? 'radiogroup' : 'group'}
          aria-labelledby={`emplacement-${groupe.id}`}
          className="space-y-2"
        >
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
                    <span className="shrink-0 text-xs font-bold text-muted-foreground">Épuisé</span>
                  ) : (
                    <Surcout valeur={lien.surcout} />
                  )
                }
              />
            );
          })}
        </div>

        {erreur && (
          <p role="alert" className="mt-2 text-xs font-semibold text-destructive">
            {erreur}
          </p>
        )}
      </div>
    </>
  );
};

// Etape : options du produit choisi pour l'emplacement.
// L'erreur s'affiche sur le groupe d'options incomplet, comme dans la modale d'options.
const EtapeOptions = ({ etape, choisis, erreur, groupesEnErreur, onChoisirOption }) => (
  <>
    <div>
      <h3 id={`emplacement-${etape.groupe.id}`} tabIndex={-1} className="font-bold outline-none">
        Personnalise : {etape.produit.nom}
      </h3>
      <p className="text-xs text-muted-foreground">{etape.groupe.nom}</p>
    </div>

    {(etape.produit.groupesOptions ?? []).map((groupeOption) => (
      <GroupeOptions
        key={groupeOption.id}
        groupe={groupeOption}
        niveauTitre={4}
        choisis={choisis}
        erreur={
          erreur && groupesEnErreur.some((g) => g.id === groupeOption.id)
            ? messageGroupeOptions(groupeOption)
            : null
        }
        onChoisir={(gOpt, idItem) => onChoisirOption(gOpt, idItem)}
      />
    ))}
  </>
);

// Recapitulatif d'un menu en modification : chaque ligne mene a son emplacement.
// Le texte visible (emplacement, choix, "Modifier") sert aussi de nom accessible.
const RecapMenu = ({ recapitulatif, onOuvrir }) => (
  <ul className="space-y-2">
    {recapitulatif.map(({ groupe, choix }) => (
      <li key={groupe.id}>
        <button
          id={`recap-${groupe.id}`}
          type="button"
          onClick={() => onOuvrir(groupe.id)}
          className="flex min-h-14 w-full items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 text-left transition-colors hover:border-muted-foreground/60 hover:bg-accent/40"
        >
          <span className="min-w-0">
            <span className="block text-xs text-muted-foreground">{groupe.nom}</span>
            {choix.length === 0 ? (
              <span className="block text-sm italic text-muted-foreground">Aucun choix</span>
            ) : (
              choix.map((c) => (
                <span key={c.idProduit} className="block text-sm font-medium">
                  {c.nom}
                  {c.options.length > 0 && (
                    <span className="font-normal text-muted-foreground"> ({c.options.join(', ')})</span>
                  )}
                </span>
              ))
            )}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
            Modifier
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </button>
      </li>
    ))}
  </ul>
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
  const { tentativesRefusees } = assemblage;

  // Element a focaliser apres le prochain rendu (titre d'etape, ligne du recapitulatif) :
  // le bouton clique disparait de l'ecran, le focus ne doit pas retomber sur la modale.
  const focusApres = useRef(null);
  useEffect(() => {
    if (!focusApres.current) return;
    document.getElementById(focusApres.current)?.focus();
    focusApres.current = null;
  });

  // Une validation refusee amene la premiere zone en erreur a l'ecran
  // et place le focus sur son premier choix disponible
  useEffect(() => {
    if (!tentativesRefusees) return;
    const zone = document.querySelector('[role="dialog"] [data-zone-erreur="true"]');
    zone?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    zone?.querySelector('button:not([disabled])')?.focus({ preventScroll: true });
  }, [tentativesRefusees]);

  if (!isOpen || !formule) return null;

  const {
    etape,
    numeroEmplacement,
    totalEmplacements,
    aDesModifications,
    enRecap,
    recapitulatif,
    ouvrirEmplacement,
    validerVersRecap,
    retourRecap,
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

  const libelleConfirmation = itemPanier ? 'Enregistrer' : 'Ajouter au panier';

  // Navigation du recapitulatif, avec le focus qui suit
  const ouvrirDepuisRecap = (idGroupe) => {
    focusApres.current = `emplacement-${idGroupe}`;
    ouvrirEmplacement(idGroupe);
  };
  const revenirAuRecap = () => {
    if (etape) focusApres.current = `recap-${etape.groupe.id}`;
    retourRecap();
  };
  // Le focus suit le resultat : ligne du recapitulatif, titre de l'ecran d'options suivant,
  // ou rien si l'etape est invalide (l'effet d'erreur place alors le focus sur le premier choix).
  const validerPuisRecap = () => {
    if (!etape) return;
    const idGroupe = etape.groupe.id;
    const resultat = validerVersRecap();
    if (resultat === 'recap') focusApres.current = `recap-${idGroupe}`;
    else if (resultat === 'options') focusApres.current = `emplacement-${idGroupe}`;
  };

  const sousTitre = enRecap
    ? 'Vérifie ton menu ou modifie un élément'
    : `Compose ton menu${etape ? ` – étape ${numeroEmplacement} sur ${totalEmplacements}` : ''}${
        etape?.type === 'options' ? ' (options)' : ''
      }`;

  // Boutons du pied : recapitulatif, etape en modification, ou parcours normal
  const actionsEtape = () => {
    if (!etape) return null;
    if (enRecap) {
      return (
        <Bouton taille="lg" onClick={confirmer}>
          {libelleConfirmation}
        </Bouton>
      );
    }
    if (itemPanier) {
      return (
        <>
          <Bouton variante="secondaire" taille="lg" onClick={revenirAuRecap}>
            Récapitulatif
          </Bouton>
          <Bouton taille="lg" onClick={validerPuisRecap}>
            Valider ce choix
          </Bouton>
        </>
      );
    }
    return (
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
    );
  };

  return (
    <ModalShell
      titre={formule.nom}
      sousTitre={sousTitre}
      onClose={onClose}
      hauteur="h-[min(640px,90svh)] sm:h-[min(640px,84svh)]"
      confirmerFermeture={
        aDesModifications
          ? {
              question: itemPanier ? 'Abandonner tes modifications ?' : 'Abandonner ce menu ?',
              libelleAbandon: 'Abandonner',
            }
          : null
      }
      prixLibelle="Total du menu"
      prixTotal={prixTotal}
      enTete={
        !enRecap &&
        totalEmplacements > 0 && <BarreProgression valeur={numeroEmplacement / totalEmplacements} />
      }
      actions={actionsEtape()}
    >
      {!etape && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Ce menu n'est pas encore configuré.
        </p>
      )}

      {enRecap && etape && <RecapMenu recapitulatif={recapitulatif} onOuvrir={ouvrirDepuisRecap} />}

      {!enRecap && etape?.type === 'groupe' && (
        <EtapeEmplacement
          groupe={etape.groupe}
          choisis={choixDuGroupe(selections, etape.groupe)}
          erreur={erreur}
          onChoisir={choisirProduit}
        />
      )}

      {!enRecap && etape?.type === 'options' && (
        <EtapeOptions
          etape={etape}
          choisis={
            choixDuGroupe(selections, etape.groupe).find((c) => c.idProduit === etape.choix.idProduit)
              ?.optionIds ?? etape.choix.optionIds
          }
          erreur={erreur}
          groupesEnErreur={groupesOptionsEnErreur(etape, selections)}
          onChoisirOption={(gOpt, idItem) =>
            choisirOption(etape.groupe, etape.choix.idProduit, gOpt, idItem)
          }
        />
      )}
    </ModalShell>
  );
};