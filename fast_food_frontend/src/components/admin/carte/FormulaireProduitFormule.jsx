import { useId, useRef, useState } from 'react';
import { Bouton } from '@/components/ui/bouton';
import { ListeDeroulante } from '@/components/ui/liste';
import { useSignalerEdition } from '@/hooks/useEditionsEnCours';
import { useEnvoi } from '@/hooks/useEnvoi';
import { FORMULAIRE_PRODUIT_FORMULE_VIDE, erreurSurcout } from '@/lib/formule';
import { attributsErreur, classeChamp, classeLabel, classeListe, classeSousFormulaire, classeTitreSection } from './classes';
import { ErreurChamp } from './ErreurChamp';

// Formulaire d'ajout d'un produit dans un emplacement. Les produits sont classés par catégorie.
// Les erreurs de saisie s'affichent sous leur champ ; onSoumettre reçoit le formulaire
// et renvoie true si le produit a été ajouté.
export const FormulaireProduitFormule = ({ categories, titre, onSoumettre, onAnnuler }) => {
  const id = useId();
  const [formulaire, setFormulaire] = useState(FORMULAIRE_PRODUIT_FORMULE_VIDE);
  const [erreurs, setErreurs] = useState({});
  const { enCours, lancer } = useEnvoi();
  const champSurcout = useRef(null);
  useSignalerEdition(true);

  const changer = (champ, valeur) => {
    setFormulaire({ ...formulaire, [champ]: valeur });
    if (erreurs[champ]) setErreurs({ ...erreurs, [champ]: undefined });
  };

  const soumettre = async (e) => {
    e.preventDefault();
    const nouvelles = {};
    if (!formulaire.idProduit) nouvelles.idProduit = 'Choisissez un produit.';
    const messageSurcout = erreurSurcout(parseFloat(formulaire.surcout || 0));
    if (messageSurcout) nouvelles.surcout = messageSurcout;
    setErreurs(nouvelles);
    if (nouvelles.idProduit) return document.getElementById(`${id}-idProduit`)?.focus();
    if (nouvelles.surcout) return champSurcout.current?.focus();

    if (await lancer(() => onSoumettre(formulaire))) onAnnuler();
  };

  return (
    <form onSubmit={soumettre} noValidate aria-labelledby={`${id}-titre`} className={classeSousFormulaire}>
      <h4 id={`${id}-titre`} className={classeTitreSection}>
        {titre}
      </h4>
      <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-idProduit`} className={classeLabel}>
            Produit
          </label>
          <ListeDeroulante
            id={`${id}-idProduit`}
            valeur={formulaire.idProduit}
            onChange={(idProduit) => changer('idProduit', idProduit)}
            groupes={categories}
            placeholder="Choisir un produit"
            className={`${classeListe} bg-card`}
            invalide={Boolean(erreurs.idProduit)}
            ariaDescribedby={erreurs.idProduit ? `${id}-erreur-idProduit` : undefined}
          />
          <ErreurChamp id={`${id}-erreur-idProduit`} message={erreurs.idProduit} />
        </div>
        <div>
          <label htmlFor={`${id}-surcout`} className={classeLabel}>
            Surcoût dans le menu (€)
          </label>
          <input
            id={`${id}-surcout`}
            ref={champSurcout}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={formulaire.surcout}
            onChange={(e) => changer('surcout', e.target.value)}
            className={`${classeChamp} bg-card tabular-nums`}
            {...attributsErreur(erreurs, 'surcout', id)}
          />
          <ErreurChamp id={`${id}-erreur-surcout`} message={erreurs.surcout} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Bouton variante="secondaire" taille="sm" onClick={onAnnuler}>
          Annuler
        </Bouton>
        <Bouton type="submit" taille="sm" disabled={enCours}>
          {enCours ? 'Ajout…' : 'Ajouter le produit'}
        </Bouton>
      </div>
    </form>
  );
};
