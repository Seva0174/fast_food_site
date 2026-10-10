import { useState } from 'react';
import { X, Check } from 'lucide-react';

const groupesOptionsDe = (produit) => produit?.groupesOptions || produit?.groupes_options || [];
const itemsDe = (groupe) => groupe.options || groupe.items || [];
const estRadio = (groupe) => groupe.minSelection === 1 && groupe.maxSelection === 1;

const decrireRegle = (groupe) => {
  if (groupe.minSelection === 1 && groupe.maxSelection === 1) return 'Choisissez 1 produit';
  if (groupe.minSelection === groupe.maxSelection) return `Choisissez ${groupe.maxSelection} produits`;
  if (groupe.minSelection === 0) return `Optionnel (jusqu'à ${groupe.maxSelection} produit(s))`;
  return `Choisissez de ${groupe.minSelection} à ${groupe.maxSelection} produits`;
};

const IndicateurChoix = ({ coche, rond }) => (
  <div
    className={`w-4 h-4 border flex items-center justify-center shrink-0 ${
      rond ? 'rounded-full' : 'rounded-md'
    } ${coche ? 'border-red-600 bg-red-600 text-white' : 'border-gray-300'}`}
  >
    {coche && <Check className="w-3 h-3 stroke-[3]" />}
  </div>
);

/**
 * Modale de composition d'un menu (formule), en etapes :
 * un ecran par emplacement, puis un ecran d'options pour chaque produit choisi qui en possede.
 *
 * produits : catalogue complet (sert a retrouver les options de chaque produit propose)
 * onConfirm(formule, choixFormule) : choixFormule contient, pour chaque produit choisi,
 * les identifiants attendus par l'API et les informations d'affichage (panier invite).
 */
export const FormuleCompositionModal = ({ formule, produits = [], itemPanier, isOpen, onClose, onConfirm }) => {
  const groupes = formule?.groupesFormule || [];

  // selections : { [idGroupe]: [ { idProduit, optionIds: [] } ] }
  const [selections, setSelections] = useState(() => {
    const initiales = {};
    (itemPanier?.composants || []).forEach((composant) => {
      const groupe = groupes.find((g) => g.id === composant.idGroupe);
      const toujoursPropose = groupe?.produits?.some((l) => l.idProduit === composant.produitId);
      if (!groupe || !toujoursPropose) return;

      if (!initiales[groupe.id]) initiales[groupe.id] = [];
      initiales[groupe.id].push({
        idProduit: composant.produitId,
        optionIds: (composant.options || []).map((opt) => (typeof opt === 'object' ? opt.id : opt)),
      });
    });
    return initiales;
  });
  const [indexEtape, setIndexEtape] = useState(0);
  const [erreur, setErreur] = useState('');

  if (!isOpen || !formule) return null;

  const trouverProduit = (idProduit) => produits.find((p) => p.id === idProduit);

  // --- Etapes : un emplacement, puis les options de chaque produit choisi qui en possede ---
  const etapes = [];
  groupes.forEach((groupe) => {
    etapes.push({ type: 'groupe', groupe });
    (selections[groupe.id] || []).forEach((choix) => {
      const produit = trouverProduit(choix.idProduit);
      if (groupesOptionsDe(produit).length > 0) {
        etapes.push({ type: 'options', groupe, choix, produit });
      }
    });
  });

  const indexCourant = Math.min(indexEtape, Math.max(etapes.length - 1, 0));
  const etape = etapes[indexCourant];
  const estDerniereEtape = indexCourant === etapes.length - 1;

  // --- Calcul du prix ---
  const calculerSupplement = (groupe, choix) => {
    const lien = groupe.produits.find((l) => l.idProduit === choix.idProduit);
    let supplement = Number(lien?.surcout || 0);

    groupesOptionsDe(trouverProduit(choix.idProduit)).forEach((groupeOption) => {
      itemsDe(groupeOption).forEach((item) => {
        if (choix.optionIds.includes(item.id)) supplement += Number(item.surcout || 0);
      });
    });
    return supplement;
  };

  let prixTotal = Number(formule.prix || 0);
  groupes.forEach((groupe) => {
    (selections[groupe.id] || []).forEach((choix) => {
      prixTotal += calculerSupplement(groupe, choix);
    });
  });

  // --- Selection des produits d'un emplacement ---
  const basculerProduit = (groupe, lien) => {
    if (!lien.estDispo) return;
    setErreur('');

    setSelections((prev) => {
      const actuels = prev[groupe.id] || [];
      const dejaChoisi = actuels.some((c) => c.idProduit === lien.idProduit);
      let nouveaux;

      if (dejaChoisi) {
        // Un choix unique obligatoire ne peut pas etre decoche, seulement remplace
        if (groupe.maxSelection === 1 && groupe.minSelection >= 1) return prev;
        nouveaux = actuels.filter((c) => c.idProduit !== lien.idProduit);
      } else if (groupe.maxSelection === 1) {
        nouveaux = [{ idProduit: lien.idProduit, optionIds: [] }];
      } else if (actuels.length >= groupe.maxSelection) {
        return prev;
      } else {
        nouveaux = [...actuels, { idProduit: lien.idProduit, optionIds: [] }];
      }

      return { ...prev, [groupe.id]: nouveaux };
    });
  };

  // --- Selection des options d'un produit choisi ---
  const basculerOption = (groupe, idProduit, groupeOption, item) => {
    setErreur('');

    setSelections((prev) => {
      const liste = (prev[groupe.id] || []).map((choix) => {
        if (choix.idProduit !== idProduit) return choix;

        const idsDuGroupe = itemsDe(groupeOption).map((i) => i.id);
        const dansGroupe = choix.optionIds.filter((id) => idsDuGroupe.includes(id));
        const autres = choix.optionIds.filter((id) => !idsDuGroupe.includes(id));

        let nouveauxDuGroupe;
        if (estRadio(groupeOption)) {
          nouveauxDuGroupe = [item.id];
        } else if (dansGroupe.includes(item.id)) {
          nouveauxDuGroupe = dansGroupe.filter((id) => id !== item.id);
        } else if (groupeOption.maxSelection && dansGroupe.length >= groupeOption.maxSelection) {
          nouveauxDuGroupe = dansGroupe;
        } else {
          nouveauxDuGroupe = [...dansGroupe, item.id];
        }

        return { ...choix, optionIds: [...autres, ...nouveauxDuGroupe] };
      });

      return { ...prev, [groupe.id]: liste };
    });
  };

  // --- Validation ---
  const validerEtape = (e) => {
    if (!e) return null;

    if (e.type === 'groupe') {
      const nombre = (selections[e.groupe.id] || []).length;
      if (nombre < e.groupe.minSelection) {
        return `Veuillez choisir au moins ${e.groupe.minSelection} produit(s) pour : ${e.groupe.nom}.`;
      }
      return null;
    }

    for (const groupeOption of groupesOptionsDe(e.produit)) {
      const idsDuGroupe = itemsDe(groupeOption).map((i) => i.id);
      const nombre = e.choix.optionIds.filter((id) => idsDuGroupe.includes(id)).length;
      const minimum = groupeOption.minSelection || 0;
      if (nombre < minimum) {
        return `Veuillez sélectionner au moins ${minimum} option(s) pour : ${groupeOption.nom} (${e.produit.nom}).`;
      }
    }
    return null;
  };

  const construireChoixFormule = () =>
    groupes.flatMap((groupe) =>
      (selections[groupe.id] || []).map((choix) => {
        const produit = trouverProduit(choix.idProduit);
        const lien = groupe.produits.find((l) => l.idProduit === choix.idProduit);

        const optionsDetails = [];
        groupesOptionsDe(produit).forEach((groupeOption) => {
          itemsDe(groupeOption).forEach((item) => {
            if (choix.optionIds.includes(item.id)) {
              optionsDetails.push({ id: item.id, nom: item.nom, surcout: Number(item.surcout || 0) });
            }
          });
        });

        return {
          idGroupe: groupe.id,
          idProduit: choix.idProduit,
          optionIds: choix.optionIds,
          // Informations d'affichage (utilisees pour le panier invite)
          nomGroupe: groupe.nom,
          nomProduit: lien?.nomProduit || produit?.nom || '',
          supplement: calculerSupplement(groupe, choix),
          optionsDetails,
        };
      })
    );

  // --- Navigation ---
  const suivant = () => {
    const message = validerEtape(etape);
    if (message) {
      setErreur(message);
      return;
    }
    setErreur('');
    setIndexEtape(indexCourant + 1);
  };

  const precedent = () => {
    setErreur('');
    setIndexEtape(Math.max(indexCourant - 1, 0));
  };

  const confirmer = () => {
    for (let i = 0; i < etapes.length; i += 1) {
      const message = validerEtape(etapes[i]);
      if (message) {
        setIndexEtape(i);
        setErreur(message);
        return;
      }
    }
    onConfirm(formule, construireChoixFormule());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* En-tête et progression */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-gray-900">{formule.nom}</h3>
              <p className="text-xs text-gray-500">
                Composez votre menu
                {etapes.length > 0 ? ` - étape ${indexCourant + 1} sur ${etapes.length}` : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {etapes.length > 0 && (
            <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600 transition-all duration-300"
                style={{ width: `${((indexCourant + 1) / etapes.length) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Corps de la modale */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {!etape && (
            <p className="text-sm text-gray-500 text-center py-6">
              Ce menu n'est pas encore configuré.
            </p>
          )}

          {/* Etape : choix des produits d'un emplacement */}
          {etape?.type === 'groupe' && (() => {
            const groupe = etape.groupe;
            const choisis = selections[groupe.id] || [];
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
                    const surcout = Number(lien.surcout || 0);

                    return (
                      <button
                        type="button"
                        key={lien.id}
                        disabled={indisponible || maxAtteint}
                        onClick={() => basculerProduit(groupe, lien)}
                        className={`w-full flex items-center justify-between gap-3 p-2.5 rounded-lg border text-left text-sm transition ${
                          estCoche
                            ? 'border-red-600 bg-red-50/40 font-medium'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        } ${indisponible || maxAtteint ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <IndicateurChoix coche={estCoche} rond={rond} />
                          {lien.imageUrl && (
                            <img
                              src={lien.imageUrl}
                              alt={lien.nomProduit}
                              className="w-10 h-10 rounded object-cover shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <span className="text-gray-800 truncate">{lien.nomProduit}</span>
                        </div>

                        <div className="shrink-0 text-xs">
                          {indisponible ? (
                            <span className="font-bold text-gray-500">Épuisé</span>
                          ) : surcout > 0 ? (
                            <span className="font-bold text-red-600">+{surcout.toFixed(2)} €</span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            );
          })()}

          {/* Etape : options d'un produit choisi */}
          {etape?.type === 'options' && (
            <>
              <div>
                <h4 className="font-bold text-gray-900">Personnalisez : {etape.produit.nom}</h4>
                <p className="text-xs text-gray-500">{etape.groupe.nom}</p>
              </div>

              {groupesOptionsDe(etape.produit).map((groupeOption) => {
                const items = itemsDe(groupeOption);
                const rond = estRadio(groupeOption);
                const choisis = etape.choix.optionIds.filter((id) => items.some((i) => i.id === id));

                return (
                  <div key={groupeOption.id} className="border border-gray-100 rounded-xl p-3.5 bg-gray-50/50">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-bold text-sm text-gray-800">{groupeOption.nom}</h5>
                      <span className="text-[11px] font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                        {groupeOption.minSelection > 0 ? 'Obligatoire' : 'Optionnel'}
                        {groupeOption.maxSelection > 1 ? ` (max ${groupeOption.maxSelection})` : ''}
                      </span>
                    </div>

                    <div className="space-y-2 mt-3">
                      {items.map((item) => {
                        const estCoche = choisis.includes(item.id);

                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() =>
                              basculerOption(etape.groupe, etape.choix.idProduit, groupeOption, item)
                            }
                            className={`w-full flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition text-sm text-left ${
                              estCoche
                                ? 'border-red-600 bg-red-50/40 font-medium'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <IndicateurChoix coche={estCoche} rond={rond} />
                              <span className="text-gray-800">{item.nom}</span>
                            </div>

                            {item.surcout > 0 && (
                              <span className="text-xs font-bold text-red-600">
                                +{Number(item.surcout).toFixed(2)} €
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {erreur && <p className="text-xs text-red-600 font-semibold">{erreur}</p>}
        </div>

        {/* Pied de modale */}
        <div className="p-4 border-t bg-white flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-gray-500 block">Total du menu</span>
            <span className="text-xl font-extrabold text-gray-900">{prixTotal.toFixed(2)} €</span>
          </div>

          <div className="flex items-center gap-2">
            {indexCourant > 0 && (
              <button
                type="button"
                onClick={precedent}
                className="px-4 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-sm transition"
              >
                Précédent
              </button>
            )}

            {etape && !estDerniereEtape && (
              <button
                type="button"
                onClick={suivant}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition text-sm"
              >
                Suivant
              </button>
            )}

            {etape && estDerniereEtape && (
              <button
                type="button"
                onClick={confirmer}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition text-sm"
              >
                {itemPanier ? 'Enregistrer les modifications' : 'Ajouter au panier'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};