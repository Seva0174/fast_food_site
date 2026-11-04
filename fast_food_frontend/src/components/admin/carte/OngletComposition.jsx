import { useId } from 'react';
import { AlertCircle, Plus } from 'lucide-react';
import { FormulaireGroupe } from '@/components/admin/groupes/FormulaireGroupe';
import { ModalConfirmation } from '@/components/modales/ModalConfirmation';
import { BandeauMessage } from '@/components/ui/bandeau';
import { Bouton } from '@/components/ui/bouton';
import { HorsModale } from '@/components/ui/hors-modale';
import { MessageFlottant } from '@/components/ui/message-flottant';
import { useCompositionFormule } from '@/hooks/useCompositionFormule';
import { useConfirmation } from '@/hooks/useConfirmation';
import { useEditionExclusive } from '@/hooks/useEditionsEnCours';
import { manqueEmplacement, trierEmplacements } from '@/lib/formule';
import { CarteEmplacement } from './CarteEmplacement';

// Onglet « Composition » de la fiche d'un menu : emplacements (ton burger, ta boisson…) et produits proposés
// dans chacun, avec leur surcoût. Chaque changement s'enregistre tout de suite ; onRefresh recharge la carte.
export function OngletComposition({ formule, produits, onRefresh }) {
  const {
    groupes,
    chargement,
    erreur,
    message,
    charger,
    creerGroupe,
    modifierGroupe,
    deplacerGroupe,
    supprimerGroupe,
    ajouterProduit,
    modifierSurcout,
    retirerProduit,
  } = useCompositionFormule(formule.id, onRefresh);
  const { confirmer, modaleProps } = useConfirmation();
  // La création d'un emplacement est une édition comme les autres : une seule à la fois dans la fiche
  const creation = useEditionExclusive();
  const idBase = useId();

  const emplacements = trierEmplacements(groupes);
  // Emplacements qui empêchent de commander le menu : résumés en haut, avec un lien vers chacun
  const incomplets = emplacements.filter((g) => manqueEmplacement(g));
  const idEmplacement = (groupe) => `${idBase}-emplacement-${groupe.id}`;
  // Défile dans le corps de la fiche seulement (scrollIntoView ferait aussi défiler la page derrière)
  const allerA = (groupe) => {
    const section = document.getElementById(idEmplacement(groupe));
    const corps = section?.closest('.overflow-y-auto');
    if (!section || !corps) return;
    const haut = section.getBoundingClientRect().top - corps.getBoundingClientRect().top + corps.scrollTop - 16;
    corps.scrollTo({ top: haut, behavior: 'smooth' });
    section.focus({ preventScroll: true });
  };

  const demanderSuppressionGroupe = async (groupe) => {
    const confirme = await confirmer({
      titre: "Supprimer l'emplacement ?",
      message: `L'emplacement « ${groupe.nom} » et la liste de ses produits seront retirés du menu. Cette action est irréversible.`,
      libelleConfirmer: "Supprimer l'emplacement",
      libelleRefuser: 'Garder',
      destructif: true,
    });
    if (confirme) await supprimerGroupe(groupe.id);
  };

  const demanderRetraitProduit = async (groupe, lien) => {
    const confirme = await confirmer({
      titre: 'Retirer ce produit ?',
      message: `« ${lien.nomProduit} » ne sera plus proposé dans « ${groupe.nom} ». Tu pourras l'ajouter de nouveau, mais son surcoût sera à ressaisir.`,
      libelleConfirmer: 'Retirer',
      libelleRefuser: 'Garder',
      destructif: true,
    });
    if (confirme) await retirerProduit(lien.id);
  };

  const creer = async (formulaire) => {
    const cree = await creerGroupe(formulaire);
    if (cree) creation.fermer();
    return cree;
  };

  // Sans emplacement, le formulaire de création est la seule chose à faire : il est ouvert d'emblée
  const formulaireVisible = creation.ouverte || groupes.length === 0;

  return (
    <div className="space-y-4">
      {chargement && (
        <p role="status" className="text-sm text-muted-foreground">
          Chargement de la composition…
        </p>
      )}
      {erreur && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <BandeauMessage message={{ texte: erreur, type: 'erreur' }} className="flex-1" />
          <Bouton variante="secondaire" onClick={charger}>
            Réessayer
          </Bouton>
        </div>
      )}

      {!chargement && !erreur && (
        <>
          <p className="text-sm text-muted-foreground">
            Les emplacements du menu et les produits proposés dans chacun. Le surcoût s'ajoute au prix de base du
            menu quand le client choisit ce produit.
          </p>

          {groupes.length === 0 && (
            <BandeauMessage
              annoncer={false}
              message={{
                type: 'erreur',
                texte: "Ce menu n'a aucun emplacement : il reste indisponible pour les clients. Crée le premier ci-dessous.",
              }}
            />
          )}

          {incomplets.length > 0 && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/15 p-3 text-sm">
              <p className="flex items-center gap-2 font-medium">
                <AlertCircle className="h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
                {incomplets.length > 1
                  ? `${incomplets.length} emplacements empêchent de commander ce menu :`
                  : 'Un emplacement empêche de commander ce menu :'}
              </p>
              <ul className="mt-1 space-y-0.5 pl-7">
                {incomplets.map((groupe) => (
                  <li key={groupe.id}>
                    <button
                      type="button"
                      onClick={() => allerA(groupe)}
                      className="rounded-sm font-semibold underline underline-offset-4 hover:no-underline"
                    >
                      {groupe.nom}
                    </button>
                    <span className="text-muted-foreground"> : {manqueEmplacement(groupe).toLowerCase()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {emplacements.map((groupe, index) => (
            <CarteEmplacement
              key={groupe.id}
              id={idEmplacement(groupe)}
              groupe={groupe}
              position={index + 1}
              premier={index === 0}
              dernier={index === emplacements.length - 1}
              produits={produits}
              onDeplacer={(sens) => deplacerGroupe(groupe.id, sens)}
              onModifierGroupe={modifierGroupe}
              onSupprimerGroupe={demanderSuppressionGroupe}
              onAjouterProduit={ajouterProduit}
              onModifierSurcout={modifierSurcout}
              onRetirerProduit={(lien) => demanderRetraitProduit(groupe, lien)}
            />
          ))}

          {formulaireVisible ? (
            <FormulaireGroupe
              titre="Nouvel emplacement"
              placeholderNom="ex : Ton accompagnement"
              libelleBouton="Créer l'emplacement"
              libelleNom="Nom"
              onCreer={creer}
              onAnnuler={groupes.length > 0 ? creation.fermer : undefined}
            />
          ) : (
            <Bouton
              variante="secondaire"
              taille="sm"
              {...creation.attente(creation.ailleurs)}
              onClick={() => !creation.ailleurs && creation.ouvrir()}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nouvel emplacement
            </Bouton>
          )}
        </>
      )}

      <HorsModale>
        <ModalConfirmation {...modaleProps} />
        <MessageFlottant message={message} />
      </HorsModale>
    </div>
  );
}
