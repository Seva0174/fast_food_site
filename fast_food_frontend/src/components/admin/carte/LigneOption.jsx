import { Pencil, Trash2 } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';
import { formaterQuantite } from '@/lib/carte';
import { formaterSupplement } from '@/lib/prix';

// Une option d'un groupe : ce qu'elle retire du stock, son surcoût, modification et suppression.
// attendre : une édition est ouverte dans la modale ; les boutons attendent (attributsAttente : aria-disabled
// et renvoi à la note de la modale). nomGroupe distingue deux options du même nom dans deux groupes.
export const LigneOption = ({
  option,
  matieresPremieres,
  nomGroupe,
  enEdition = false,
  attendre = false,
  attributsAttente = {},
  onModifier,
  onSupprimer,
}) => {
  const matiere = matieresPremieres.find((m) => m.id === option.idMatiere);
  const aUnSurcout = Number(option.surcout) > 0;

  return (
    <li
      className={`flex items-center justify-between gap-2 rounded-lg border py-1.5 pl-3 pr-1 text-sm ${
        enEdition ? 'border-foreground/60 bg-muted/50' : 'border-border'
      }`}
    >
      <div className="min-w-0">
        <span className="font-medium">{option.nom}</span>
        {aUnSurcout && (
          <span className="ml-2 font-semibold tabular-nums">{formaterSupplement(option.surcout)}</span>
        )}
        <p className="text-sm tabular-nums text-muted-foreground">
          {option.idMatiere
            ? `Retire ${formaterQuantite(option.quantiteDeduite, matiere?.uniteMesure)}${
                matiere && matiere.nom !== option.nom ? ` de ${matiere.nom}` : ''
              } du stock`
            : 'Ne retire rien du stock'}
        </p>
      </div>

      <div className="flex shrink-0 items-center">
        <Bouton
          variante="fantome"
          taille="nu"
          className="size-9"
          onClick={() => !attendre && onModifier()}
          aria-label={`Modifier ${option.nom} (${nomGroupe})`}
          title="Modifier"
          {...attributsAttente}
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </Bouton>
        <Bouton
          variante="fantomeDanger"
          taille="nu"
          className="size-9"
          onClick={() => !attendre && onSupprimer()}
          aria-label={`Supprimer ${option.nom} (${nomGroupe})`}
          title="Supprimer"
          {...attributsAttente}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Bouton>
      </div>
    </li>
  );
};
