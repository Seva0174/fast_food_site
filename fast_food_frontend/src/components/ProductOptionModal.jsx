import { useState } from 'react';
import { X, Check } from 'lucide-react';

export const ProductOptionModal = ({ produit, itemPanier, isOpen, onClose, onConfirm }) => {
  const groupes = produit?.groupesOptions || produit?.groupes_options || [];

  // Initialisation dynamique des sélections au montage / changement de produit/itemPanier
  const [selections, setSelections] = useState(() => {
    if (!produit) return {};
    const initialSelections = {};
    const optionsExistantes = itemPanier?.options || itemPanier?.optionItemIds || produit.options || [];
    const selectedIds = optionsExistantes.map((opt) => (typeof opt === 'object' ? opt.id : opt));

    groupes.forEach((groupe) => {
      const items = groupe.options || groupe.items || [];
      const choisisDansCeGroupe = items
        .filter((item) => selectedIds.includes(item.id))
        .map((item) => item.id);

      if (choisisDansCeGroupe.length > 0) {
        initialSelections[groupe.id] = choisisDansCeGroupe;
      }
    });

    return initialSelections;
  });

  const [erreurs, setErreurs] = useState({});

  if (!isOpen || !produit) return null;

  // Calcul dynamique du prix total lors du rendu
  let basePrix = Number(produit.prix || 0);
  let surcouts = 0;

  Object.entries(selections).forEach(([groupeId, optionIds]) => {
    const groupe = groupes.find((g) => g.id === Number(groupeId));
    const items = groupe?.options || groupe?.items || [];

    optionIds.forEach((itemId) => {
      const item = items.find((i) => i.id === itemId);
      if (item && item.surcout) {
        surcouts += Number(item.surcout);
      }
    });
  });

  const prixTotal = basePrix + surcouts;

  const handleRadioSelect = (groupeId, optionItemId) => {
    setSelections((prev) => ({
      ...prev,
      [groupeId]: [optionItemId],
    }));
    setErreurs((prev) => ({ ...prev, [groupeId]: null }));
  };

  const handleCheckboxToggle = (groupe, optionItemId) => {
    const actuels = selections[groupe.id] || [];
    const dejaChoisi = actuels.includes(optionItemId);

    let nouveaux = [];
    if (dejaChoisi) {
      nouveaux = actuels.filter((id) => id !== optionItemId);
    } else {
      if (groupe.maxSelection && actuels.length >= groupe.maxSelection) {
        return;
      }
      nouveaux = [...actuels, optionItemId];
    }

    setSelections((prev) => ({
      ...prev,
      [groupe.id]: nouveaux,
    }));

    if (nouveaux.length >= (groupe.minSelection || 0)) {
      setErreurs((prev) => ({ ...prev, [groupe.id]: null }));
    }
  };

  const ValiderEtAjouter = () => {
    let valide = true;
    const deNouvellesErreurs = {};

    groupes.forEach((groupe) => {
      const choisis = selections[groupe.id] || [];
      const min = groupe.minSelection || 0;
      if (choisis.length < min) {
        valide = false;
        deNouvellesErreurs[groupe.id] = `Veuillez sélectionner au moins ${min} option(s).`;
      }
    });

    if (!valide) {
      setErreurs(deNouvellesErreurs);
      return;
    }

    const optionItemIds = Object.values(selections).flat();
    onConfirm(produit, optionItemIds);
    handleClose();
  };

  const handleClose = () => {
    setSelections({});
    setErreurs({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* En-tête */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-lg text-gray-900">{produit.nom}</h3>
            <p className="text-xs text-gray-500">Personnalisez votre commande</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps de la modal */}
        <div className="p-4 overflow-y-auto space-y-6 flex-1">
          {groupes.map((groupe) => {
            const isRadio = groupe.minSelection === 1 && groupe.maxSelection === 1;
            const choisis = selections[groupe.id] || [];
            const erreur = erreurs[groupe.id];
            const items = groupe.options || groupe.items || [];

            return (
              <div key={groupe.id} className="border border-gray-100 rounded-xl p-3.5 bg-gray-50/50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-sm text-gray-800">{groupe.nom}</h4>
                  <span className="text-[11px] font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                    {groupe.minSelection > 0 ? 'Obligatoire' : 'Optionnel'}
                    {groupe.maxSelection > 1 ? ` (max ${groupe.maxSelection})` : ''}
                  </span>
                </div>

                <div className="space-y-2 mt-3">
                  {items.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Aucune option disponible.</p>
                  ) : (
                    items.map((item) => {
                      const estCoche = choisis.includes(item.id);

                      return (
                        <label
                          key={item.id}
                          onClick={() =>
                            isRadio
                              ? handleRadioSelect(groupe.id, item.id)
                              : handleCheckboxToggle(groupe, item.id)
                          }
                          className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition text-sm ${
                            estCoche
                              ? 'border-red-600 bg-red-50/40 font-medium'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-${
                                isRadio ? 'full' : 'md'
                              } border flex items-center justify-center ${
                                estCoche ? 'border-red-600 bg-red-600 text-white' : 'border-gray-300'
                              }`}
                            >
                              {estCoche && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-gray-800">{item.nom}</span>
                          </div>

                          {item.surcout > 0 && (
                            <span className="text-xs font-bold text-red-600">
                              +{Number(item.surcout).toFixed(2)} €
                            </span>
                          )}
                        </label>
                      );
                    })
                  )}
                </div>

                {erreur && <p className="text-xs text-red-600 font-semibold mt-2">{erreur}</p>}
              </div>
            );
          })}
        </div>

        {/* Pied de modal */}
        <div className="p-4 border-t bg-white flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-gray-500 block">Total produit</span>
            <span className="text-xl font-extrabold text-gray-900">
              {prixTotal.toFixed(2)} €
            </span>
          </div>

          <button
            onClick={ValiderEtAjouter}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition text-sm"
          >
            {itemPanier ? 'Enregistrer les modifications' : 'Ajouter au panier'}
          </button>
        </div>

      </div>
    </div>
  );
};