import { useState } from 'react';
import { EnTeteGroupe } from '@/components/admin/groupes/EnTeteGroupe';
import { Bouton } from '@/components/ui/bouton';
import {
  avertissementsEmplacement,
  grouperParCategorie,
  produitsAjoutables,
} from '@/lib/formule';
import { FormulaireProduitFormule } from './FormulaireProduitFormule';
import { LienProduitFormule } from './LienProduitFormule';

const CLASSES_AVERTISSEMENT = {
  attention: 'border-amber-200 bg-amber-50 text-amber-700',
  erreur: 'border-red-200 bg-red-50 text-red-700',
};

// Un emplacement de menu : en-tête, avertissements, produits proposés et ajout d'un produit.
export const CarteEmplacement = ({
  groupe,
  produits,
  onModifierGroupe,
  onSupprimerGroupe,
  onAjouterProduit,
  onModifierSurcout,
  onRetirerProduit,
}) => {
  const [ajoutOuvert, setAjoutOuvert] = useState(false);

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="border-b bg-gray-50 px-4 py-3">
        <EnTeteGroupe
          groupe={groupe}
          avecOrdre
          onModifier={onModifierGroupe}
          onSupprimer={onSupprimerGroupe}
        />
      </div>

      <div className="space-y-3 p-4">
        {avertissementsEmplacement(groupe).map((avertissement) => (
          <p
            key={avertissement.texte}
            className={`rounded border px-3 py-2 text-xs ${CLASSES_AVERTISSEMENT[avertissement.gravite]}`}
          >
            {avertissement.texte}
          </p>
        ))}

        {groupe.produits.length === 0 ? (
          <p className="text-xs italic text-gray-400">Aucun produit dans cet emplacement. Ajoutez-en un ci-dessous.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {groupe.produits.map((lien) => (
              <LienProduitFormule
                key={lien.id}
                lien={lien}
                onModifierSurcout={onModifierSurcout}
                onRetirer={onRetirerProduit}
              />
            ))}
          </div>
        )}

        {ajoutOuvert ? (
          <FormulaireProduitFormule
            categories={grouperParCategorie(produitsAjoutables(produits, groupe))}
            titre={`Ajouter un produit à "${groupe.nom}"`}
            onSoumettre={(formulaire) => onAjouterProduit(groupe.id, formulaire)}
            onAnnuler={() => setAjoutOuvert(false)}
          />
        ) : (
          <Bouton variante="contour" taille="xs" onClick={() => setAjoutOuvert(true)}>
            + Ajouter un produit
          </Bouton>
        )}
      </div>
    </div>
  );
};