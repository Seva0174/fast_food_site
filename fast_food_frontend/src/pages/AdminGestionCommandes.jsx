import { useState, useMemo, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { useCommandesAdmin } from '../hooks/useCommandesAdmin';
import { CommandeCard } from '../components/commande/CommandeCard';
import { CommandeDetailModal } from '../components/commande/CommandeDetailModal';
import { BarreFiltresCommandes } from '../components/commande/BarreFiltresCommandes';
import { Bouton } from '../components/ui/bouton';
import { BandeauMessage } from '../components/ui/bandeau';

import {
  FILTRE_STATUT,
  FILTRE_TYPE_TOUS,
  compterCommandes,
  filtrerCommandes,
  trierParDate,
} from '../lib/commande';

const FILTRES_INITIAUX = {
  statut: FILTRE_STATUT.EN_COURS,
  typeRetrait: FILTRE_TYPE_TOUS,
  recherche: '',
};

export const AdminGestionCommandes = () => {
    const { commandes, chargement, erreur, message, miseAJourId, charger, changerStatut } =
    useCommandesAdmin();

  const [commandeSelectionnee, setCommandeSelectionnee] = useState(null);
  const [filtres, setFiltres] = useState(FILTRES_INITIAUX);
  const [ordre, setOrdre] = useState('desc');

  const modifierFiltre = useCallback(
    (cle, valeur) => setFiltres((prev) => ({ ...prev, [cle]: valeur })),
    []
  );

  const commandesAffichees = useMemo(
    () => trierParDate(filtrerCommandes(commandes, filtres), ordre),
    [commandes, filtres, ordre]
  );

  const compteurs = useMemo(() => compterCommandes(commandes), [commandes]);

  // Stable grace a useCallback : CommandeCard (memo) ne se redessine pas inutilement.
  const handleChangerStatut = useCallback(
    async (id, statut) => {
      const modifiee = await changerStatut(id, statut);
      if (modifiee) {
        setCommandeSelectionnee((prev) => (prev?.id === id ? modifiee : prev));
      }
    },
    [changerStatut]
  );

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Gestion des Commandes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Suivez et mettez à jour l'état des commandes en temps réel.
          </p>
        </div>

        <Bouton variante="secondaire" onClick={charger} disabled={chargement}>
          <RefreshCw className={`h-4 w-4 ${chargement ? 'animate-spin' : ''}`} />
          Actualiser
        </Bouton>
      </div>

      <BarreFiltresCommandes
        filtres={filtres}
        onChange={modifierFiltre}
        ordre={ordre}
        onChangerOrdre={() => setOrdre((o) => (o === 'desc' ? 'asc' : 'desc'))}
        compteurs={compteurs}
      />
      {message && (
        <div className="mb-6">
          <BandeauMessage message={message} />
        </div>
      )}
      
      {erreur && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {erreur}
        </div>
      )}

      {chargement ? (
        <div className="py-12 text-center">
          <RefreshCw className="mx-auto mb-2 h-8 w-8 animate-spin text-red-600" />
          <p className="text-gray-500">Chargement des commandes...</p>
        </div>
      ) : commandesAffichees.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          Aucune commande correspondant aux filtres.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {commandesAffichees.map((commande) => (
            <CommandeCard
              key={commande.id}
              commande={commande}
              onChangerStatut={handleChangerStatut}
              onVoirDetail={setCommandeSelectionnee}
              enCours={miseAJourId === commande.id}
            />
          ))}
        </div>
      )}

      <CommandeDetailModal
        commande={commandeSelectionnee}
        onClose={() => setCommandeSelectionnee(null)}
      />
    </div>
  );
};