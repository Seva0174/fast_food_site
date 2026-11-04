import { useState, useMemo, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { useCommandesAdmin } from '../hooks/useCommandesAdmin';
import { useConfirmation } from '../hooks/useConfirmation';
import { CommandeCard } from '../components/commande/CommandeCard';
import { CommandeDetailModal } from '../components/commande/CommandeDetailModal';
import { BarreFiltresCommandes } from '../components/commande/BarreFiltresCommandes';
import { ModalConfirmation } from '../components/modales/ModalConfirmation';
import { Bouton } from '../components/ui/bouton';
import { BandeauMessage } from '../components/ui/bandeau';

import {
  FILTRE_STATUT,
  FILTRE_TYPE_TOUS,
  INTERVALLE_ACTUALISATION_MS,
  STATUT_COMMANDE,
  compterCommandes,
  filtrerCommandes,
  formaterHeure,
  prochaineCommande,
  trierParDate,
} from '../lib/commande';
import { useTitrePage } from '@/hooks/useTitrePage';

const FILTRES_INITIAUX = {
  statut: FILTRE_STATUT.EN_COURS,
  typeRetrait: FILTRE_TYPE_TOUS,
  recherche: '',
};

export const AdminGestionCommandes = () => {
  useTitrePage('Gestion des commandes');
  const {
    commandes,
    chargement,
    erreur,
    message,
    miseAJourId,
    derniereMaj,
    nouvellesIds,
    charger,
    changerStatut,
  } = useCommandesAdmin();
  const { confirmer, modaleProps } = useConfirmation();

  const [commandeSelectionnee, setCommandeSelectionnee] = useState(null);
  const [filtres, setFiltres] = useState(FILTRES_INITIAUX);
  // Plus anciennes d'abord : la file se lit dans l'ordre ou la cuisine la traite
  const [ordre, setOrdre] = useState('asc');

  const modifierFiltre = useCallback(
    (cle, valeur) => setFiltres((prev) => ({ ...prev, [cle]: valeur })),
    []
  );

  const commandesAffichees = useMemo(
    () => trierParDate(filtrerCommandes(commandes, filtres), ordre),
    [commandes, filtres, ordre]
  );

  const compteurs = useMemo(() => compterCommandes(commandes), [commandes]);
  const idProchaine = useMemo(() => prochaineCommande(commandesAffichees), [commandesAffichees]);

  // Stable grace a useCallback : CommandeCard (memo) ne se redessine pas inutilement.
  const handleChangerStatut = useCallback(
    async (id, statut) => {
      if (statut === STATUT_COMMANDE.ANNULEE) {
        const confirme = await confirmer({
          titre: `Annuler la commande #${id} ?`,
          message: 'La commande passera au statut « Annulée » et ne sera plus préparée.',
          libelleConfirmer: 'Annuler la commande',
          libelleRefuser: 'Garder la commande',
          destructif: true,
        });
        if (!confirme) return;
      }

      const modifiee = await changerStatut(id, statut);
      if (modifiee) {
        setCommandeSelectionnee((prev) => (prev?.id === id ? modifiee : prev));
      }
    },
    [changerStatut, confirmer]
  );

  // Premier chargement seulement : une actualisation garde la liste affichee.
  const premierChargement = chargement && commandes.length === 0;

  return (
    <div>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="titre-marque text-4xl">Gestion des commandes</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            La liste s'actualise toute seule toutes les {INTERVALLE_ACTUALISATION_MS / 1000} secondes.
            {derniereMaj && (
              <span className="tabular-nums"> Dernière mise à jour à {formaterHeure(derniereMaj)}.</span>
            )}
          </p>
        </div>

        <Bouton variante="secondaire" onClick={charger} disabled={chargement}>
          <RefreshCw className={`h-4 w-4 ${chargement ? 'animate-spin' : ''}`} aria-hidden="true" />
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

      {erreur && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <BandeauMessage message={{ texte: erreur, type: 'erreur' }} className="flex-1" />
          <Bouton variante="secondaire" onClick={charger} disabled={chargement}>
            Réessayer
          </Bouton>
        </div>
      )}

      {premierChargement ? (
        <div className="py-12 text-center" role="status">
          <RefreshCw className="mx-auto mb-2 h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          <p className="text-muted-foreground">Chargement des commandes...</p>
        </div>
      ) : commandesAffichees.length === 0 ? (
        !erreur && (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            Aucune commande correspondant aux filtres.
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {commandesAffichees.map((commande) => (
            <CommandeCard
              key={commande.id}
              commande={commande}
              onChangerStatut={handleChangerStatut}
              onVoirDetail={setCommandeSelectionnee}
              enCours={miseAJourId === commande.id}
              prioritaire={commande.id === idProchaine}
              nouvelle={
                commande.status === STATUT_COMMANDE.EN_ATTENTE && nouvellesIds.includes(commande.id)
              }
            />
          ))}
        </div>
      )}

      <CommandeDetailModal
        commande={commandeSelectionnee}
        onClose={() => setCommandeSelectionnee(null)}
      />
      <ModalConfirmation {...modaleProps} />

      {/* Retour d'action : en bas de l'ecran pour ne pas decaler la liste */}
      {message && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[70] w-full max-w-md -translate-x-1/2 px-4">
          <BandeauMessage
            message={message}
            className="shadow-xl shadow-black/40 animate-in fade-in slide-in-from-bottom-2 duration-200"
          />
        </div>
      )}
    </div>
  );
};
