import { useState, useEffect, useContext } from 'react';
import { User, MapPin, Package, Clock, History, Eye, CheckCircle2, Save } from 'lucide-react';
import { AuthContext } from '../context/AuthProvider';
import { getMesCommandesApi } from '../api/commandeApi';
import { CommandeDetailModal } from '../components/commande/CommandeDetailModal';
import { BadgeStatutCommande } from '../components/commande/BadgeStatutCommande';
import { Bouton } from '../components/ui/bouton';
import { enregistrerAdresse, lireAdresseEnregistree } from '../lib/adresse';
import { estEnCours, estTerminee } from '../lib/commande';

const ADRESSE_COMPTE_VIDE = { rue: '', ville: '', codePostal: '' };

const CHAMPS_ADRESSE = [
  { nom: 'rue', libelle: 'Rue', placeholder: '12 Rue de la Paix', pleine: true },
  { nom: 'codePostal', libelle: 'Code postal', placeholder: '75000' },
  { nom: 'ville', libelle: 'Ville', placeholder: 'Paris' },
];

const VIDES = {
  encours: { icone: Package, message: 'Aucune commande en cours pour le moment.' },
  historique: { icone: History, message: 'Aucune commande passée enregistrée.' },
};

const CarteCommandeClient = ({ commande, onDetails }) => (
  <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-extrabold text-gray-900">Commande #{commande.id}</span>
        <BadgeStatutCommande statut={commande.status} />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Total : <span className="font-bold text-gray-800">{Number(commande.total).toFixed(2)} €</span>
      </p>
    </div>

    <Bouton variante="neutre" taille="xs" onClick={onDetails}>
      <Eye className="h-4 w-4" /> Détails
    </Bouton>
  </div>
);

const ListeCommandes = ({ commandes, chargement, onDetails, cle }) => {
  if (chargement) {
    return <p className="py-8 text-center text-gray-500">Chargement des commandes...</p>;
  }

  if (commandes.length === 0) {
    const { icone: Icone, message } = VIDES[cle];
    return (
      <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-8 text-center">
        <Icone className="mx-auto h-12 w-12 text-gray-300" />
        <p className="font-medium text-gray-600">{message}</p>
      </div>
    );
  }

  return commandes.map((commande) => (
    <CarteCommandeClient key={commande.id} commande={commande} onDetails={() => onDetails(commande)} />
  ));
};

export const PageUser = () => {
  const { user } = useContext(AuthContext);
  const idUser = user?.id;

  const [adresse, setAdresse] = useState(ADRESSE_COMPTE_VIDE);
  const [adresseSauvegardee, setAdresseSauvegardee] = useState(false);
  const [commandes, setCommandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [commandeOuverte, setCommandeOuverte] = useState(null);
  const [onglet, setOnglet] = useState('encours');

  // Adresse enregistree de l'utilisateur
  useEffect(() => {
    if (!idUser) return;
    const enregistree = lireAdresseEnregistree(idUser);
    if (enregistree) setAdresse(enregistree);
  }, [idUser]);

  // Commandes de l'utilisateur
  useEffect(() => {
    let annule = false;

    const charger = async () => {
      try {
        const data = await getMesCommandesApi();
        if (!annule) setCommandes(data);
      } catch (erreur) {
        console.error('Erreur lors de la récupération des commandes :', erreur);
      } finally {
        if (!annule) setChargement(false);
      }
    };

    charger();
    return () => {
      annule = true;
    };
  }, [idUser]);

  const modifierChamp = (nom, valeur) => setAdresse((prev) => ({ ...prev, [nom]: valeur }));

  const sauvegarderAdresse = (e) => {
    e.preventDefault();
    enregistrerAdresse(idUser, adresse);
    setAdresseSauvegardee(true);
    setTimeout(() => setAdresseSauvegardee(false), 3000);
  };

  const commandesEnCours = commandes.filter(estEnCours);
  const commandesPassees = commandes.filter(estTerminee);
  const listeAffichee = onglet === 'encours' ? commandesEnCours : commandesPassees;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="flex items-center gap-3 text-3xl font-extrabold text-gray-900">
          <User className="h-8 w-8 text-red-600" />
          <span>Espace Mon Compte</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        <div className="space-y-6">
          <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="border-b border-gray-100 pb-2 text-lg font-bold text-gray-800">Mes Informations</h2>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Nom</p>
              <p className="font-semibold text-gray-800">{user?.nom || 'Non renseigné'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Email</p>
              <p className="font-medium text-gray-700">{user?.email}</p>
            </div>
          </div>

          <form
            onSubmit={sauvegarderAdresse}
            className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <MapPin className="h-5 w-5 text-red-600" />
              <h2 className="text-lg font-bold text-gray-800">Adresse par défaut</h2>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {CHAMPS_ADRESSE.map((champ) => (
                <div key={champ.nom} className={champ.pleine ? 'col-span-2' : ''}>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">{champ.libelle}</label>
                  <input
                    type="text"
                    required
                    placeholder={champ.placeholder}
                    value={adresse[champ.nom]}
                    onChange={(e) => modifierChamp(champ.nom, e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              ))}
            </div>

            <Bouton type="submit" variante="sombre" className="w-full">
              <Save className="h-4 w-4" />
              <span>Enregistrer l'adresse</span>
            </Bouton>

            {adresseSauvegardee && (
              <p className="flex items-center justify-center gap-1 pt-1 text-xs font-medium text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Enregistrée avec succès !
              </p>
            )}
          </form>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="flex gap-2 border-b border-gray-200 pb-2">
            <Bouton
              variante={onglet === 'encours' ? 'principal' : 'secondaire'}
              taille="sm"
              onClick={() => setOnglet('encours')}
            >
              <Clock className="h-4 w-4" />
              Commandes en cours ({commandesEnCours.length})
            </Bouton>
            <Bouton
              variante={onglet === 'historique' ? 'principal' : 'secondaire'}
              taille="sm"
              onClick={() => setOnglet('historique')}
            >
              <History className="h-4 w-4" />
              Historique ({commandesPassees.length})
            </Bouton>
          </div>

          <div className="space-y-4">
            <ListeCommandes
              cle={onglet}
              commandes={listeAffichee}
              chargement={chargement}
              onDetails={setCommandeOuverte}
            />
          </div>
        </div>
      </div>

      <CommandeDetailModal commande={commandeOuverte} onClose={() => setCommandeOuverte(null)} />
    </div>
  );
};