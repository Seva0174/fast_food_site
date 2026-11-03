import { useId } from 'react';
import { Plus, X } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { ListeDeroulante } from '@/components/ui/liste';
import {
  SAISIE_INGREDIENT_VIDE,
  ajouterIngredient,
  erreurIngredient,
  formaterQuantite,
  retirerIngredient,
} from '@/lib/carte';
import { classeBadge, classeChamp, classeLabel, classeListe, classeTitreSection } from './classes';

// « 2 ingrédients », « 1 ingrédient + 1 à ajouter » : l'ingrédient choisi mais pas encore ajouté compte à part.
const libelleNombreIngredients = (nombre, enAttente) => {
  const ajoutes = nombre === 0 ? 'Aucun ingrédient' : `${nombre} ingrédient${nombre > 1 ? 's' : ''}`;
  if (!enAttente) return ajoutes;
  return nombre === 0 ? '1 à ajouter' : `${ajoutes} + 1 à ajouter`;
};

// Recette d'un produit : ingrédients du stock et quantités requises.
// onChange reçoit la nouvelle recette à chaque ajout ou retrait.
// saisie / onSaisie : ingrédient en cours de choix ({ idMatiere, quantite, erreur }), tenu par la modale
// pour qu'un ingrédient choisi mais pas encore ajouté ne soit pas perdu à l'enregistrement.
export const EditeurRecette = ({ recette, matieresPremieres, onChange, saisie, onSaisie }) => {
  const id = useId();
  const { idMatiere, quantite, erreur } = saisie;
  const modifierSaisie = (changement) => onSaisie({ ...saisie, erreur: '', ...changement });

  const matiereChoisie = matieresPremieres.find((m) => String(m.id) === idMatiere);

  const ajouter = () => {
    const quantiteSaisie = parseFloat(quantite);
    const messageErreur = erreurIngredient(matiereChoisie, quantiteSaisie);
    if (messageErreur) return onSaisie({ ...saisie, erreur: messageErreur });

    onChange(ajouterIngredient(recette, matiereChoisie, quantiteSaisie));
    onSaisie(SAISIE_INGREDIENT_VIDE);
  };

  return (
    <section aria-labelledby={`${id}-titre`} className="space-y-4 rounded-lg border border-border bg-muted/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 id={`${id}-titre`} className={classeTitreSection}>
          Recette
        </h3>
        <span className={`${classeBadge} tabular-nums`}>
          {libelleNombreIngredients(recette.length, Boolean(matiereChoisie))}
        </span>
      </div>
      <p className="-mt-2 text-sm text-muted-foreground">
        Chaque vente retire ces quantités du stock.
      </p>

      <div className="space-y-3">
        <div>
          <label htmlFor={`${id}-matiere`} className={classeLabel}>
            Ingrédient du stock
          </label>
          <ListeDeroulante
            id={`${id}-matiere`}
            valeur={idMatiere}
            onChange={(valeur) => modifierSaisie({ idMatiere: valeur })}
            options={matieresPremieres.map((m) => ({ value: m.id, label: m.nom }))}
            placeholder="Choisir un ingrédient"
            className={`${classeListe} bg-card`}
          />
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor={`${id}-quantite`} className={classeLabel}>
              Quantité par produit{matiereChoisie?.uniteMesure ? ` (${matiereChoisie.uniteMesure})` : ''}
            </label>
            <input
              id={`${id}-quantite`}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              value={quantite}
              onChange={(e) => modifierSaisie({ quantite: e.target.value })}
              onKeyDown={(e) => {
                // Entrée ajoute l'ingrédient au lieu d'enregistrer le produit
                if (e.key === 'Enter') {
                  e.preventDefault();
                  ajouter();
                }
              }}
              aria-invalid={Boolean(erreur)}
              aria-describedby={erreur ? `${id}-erreur` : undefined}
              className={`${classeChamp} bg-card tabular-nums`}
            />
          </div>
          <Bouton variante="secondaire" taille="sm" className="min-h-10" onClick={ajouter}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Ajouter
          </Bouton>
        </div>

        {erreur && (
          <p id={`${id}-erreur`} role="alert" className="text-sm font-medium text-destructive">
            {erreur}
          </p>
        )}
      </div>

      {(recette.length > 0 || matiereChoisie) && (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card text-sm">
          {recette.map((ingredient) => (
            <li key={ingredient.idMatiere} className="flex items-center justify-between gap-3 py-1 pl-3 pr-1">
              <span>
                <span className="font-medium">{ingredient.nomMatiere}</span>
                <span className="ml-2 tabular-nums text-muted-foreground">
                  {formaterQuantite(ingredient.quantiteRequise, ingredient.uniteMesure)}
                </span>
              </span>
              <Bouton
                variante="fantomeDanger"
                taille="nu"
                className="size-9 shrink-0"
                onClick={() => onChange(retirerIngredient(recette, ingredient.idMatiere))}
                title="Retirer de la recette"
                aria-label={`Retirer ${ingredient.nomMatiere} de la recette`}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Bouton>
            </li>
          ))}
          {/* Ingrédient choisi mais pas encore ajouté : il le sera à l'enregistrement du produit */}
          {matiereChoisie && (
            <li className="flex items-center gap-2 border-dashed py-2.5 pl-3 pr-3 text-muted-foreground">
              <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                <span className="font-medium text-foreground">{matiereChoisie.nom}</span>
                <span className="ml-2 tabular-nums">
                  {formaterQuantite(parseFloat(quantite), matiereChoisie.uniteMesure)}
                </span>
                <span className="ml-2">: sera ajouté à l'enregistrement</span>
              </span>
            </li>
          )}
        </ul>
      )}
    </section>
  );
};
