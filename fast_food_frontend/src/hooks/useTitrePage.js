import { useEffect } from 'react';
import { NOM_SITE } from '@/lib/site';

// Titre de l'onglet du navigateur : « Mon compte · Taco Burger ». Sans titre, le nom du site seul.
// Chaque page a ainsi un titre distinct (historique, onglets, lecteurs d'écran).
export const useTitrePage = (titre) => {
  useEffect(() => {
    document.title = titre ? `${titre} · ${NOM_SITE}` : NOM_SITE;
  }, [titre]);
};
