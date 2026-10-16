import { useEffect, useState } from 'react';
import { ADRESSE_VIDE, adresseVersCommande, lireAdresseEnregistree } from '../lib/adresse';

// Adresse de livraison saisie a la commande, prerempli avec l'adresse enregistree de l'utilisateur.
export const useAdresseLivraison = (idUser) => {
  const [adresse, setAdresse] = useState(ADRESSE_VIDE);

  useEffect(() => {
    if (!idUser) return;
    const enregistree = lireAdresseEnregistree(idUser);
    if (enregistree) setAdresse(adresseVersCommande(enregistree));
  }, [idUser]);

  // nom : cpRue, cpVille ou cpCodePostal
  const modifierChamp = (nom, valeur) => setAdresse((prev) => ({ ...prev, [nom]: valeur }));

  return { adresse, modifierChamp };
};