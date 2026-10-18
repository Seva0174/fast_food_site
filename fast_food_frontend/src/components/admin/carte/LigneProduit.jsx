import { Bouton } from '@/components/ui/bouton';
import { ImageProduit } from './ImageProduit';

// Une ligne du tableau de la carte : informations, disponibilité et actions.
export const LigneProduit = ({
  produit,
  onChangerDisponibilite,
  onGererComposition,
  onGererOptions,
  onModifier,
  onSupprimer,
}) => (
  <tr className="transition-colors hover:bg-gray-50/50">
    <td className="px-4 py-3">
      <ImageProduit url={produit.imageUrl} alt={produit.nom} />
    </td>

    <td className="px-4 py-3 font-medium text-gray-900">
      {produit.nom}
      {produit.estFormule && (
        <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 align-middle text-[10px] font-bold text-red-700">
          Menu
        </span>
      )}
      {produit.estFormule && !produit.formuleRealisable && (
        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 align-middle text-[10px] font-bold text-amber-800">
          À configurer ou indisponible
        </span>
      )}
      {produit.description && (
        <p className="line-clamp-1 text-xs font-normal text-gray-400">{produit.description}</p>
      )}
    </td>

    <td className="px-4 py-3 text-gray-600">{produit.categorie.nom}</td>

    <td className="px-4 py-3 font-semibold text-gray-800">{produit.prix.toFixed(2)} €</td>

    <td className="px-4 py-3">
      <Bouton
        variante={produit.estDispo ? 'succesDoux' : 'dangerDoux'}
        taille="pastille"
        onClick={() => onChangerDisponibilite(produit)}
      >
        {produit.estDispo ? 'Disponible' : 'Rupture'}
      </Bouton>
    </td>

    <td className="px-4 py-3">
      <div className="flex items-center justify-end gap-2">
        {produit.estFormule ? (
          <Bouton variante="contourAccent" taille="xs" onClick={() => onGererComposition(produit)}>
            Composition
          </Bouton>
        ) : (
          <Bouton variante="contourAccent" taille="xs" onClick={() => onGererOptions(produit)}>
            Options
          </Bouton>
        )}
        <Bouton variante="contourInfo" taille="xs" onClick={() => onModifier(produit)}>
          Modifier
        </Bouton>
        <Bouton variante="contour" taille="xs" onClick={() => onSupprimer(produit)}>
          Supprimer
        </Bouton>
      </div>
    </td>
  </tr>
);