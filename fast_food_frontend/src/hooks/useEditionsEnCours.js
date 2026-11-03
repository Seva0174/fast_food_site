import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState } from 'react';

// Sous-formulaires ouverts dans une modale (ajout d'une option, édition d'un groupe...).
// La modale fournit le contexte (valeur renvoyée par useEditionsEnCours) :
// - useSignalerEdition : un sous-formulaire déclare des modifications en cours ;
// - useEditionExclusive : une seule édition ouverte à la fois, les autres boutons attendent.
// `enCours` permet à la modale de demander confirmation avant de fermer.
export const ContexteEditions = createContext(null);

export const useEditionsEnCours = () => {
  const [ouvertes, setOuvertes] = useState(() => new Set());
  const [idActif, setIdActif] = useState(null);

  const signaler = useCallback((id, ouverte) => {
    setOuvertes((precedentes) => {
      if (precedentes.has(id) === ouverte) return precedentes;
      const suivantes = new Set(precedentes);
      if (ouverte) suivantes.add(id);
      else suivantes.delete(id);
      return suivantes;
    });
  }, []);

  // Note affichée par la modale pendant une édition ; les boutons en attente y renvoient (aria-describedby)
  const idNote = useId();
  const contexte = useMemo(() => ({ signaler, idActif, setIdActif, idNote }), [signaler, idActif, idNote]);

  return { enCours: ouvertes.size > 0 || idActif !== null, editionOuverte: idActif !== null, contexte };
};

// Déclare une édition ouverte (ouverte = true) tant que le composant l'indique.
export const useSignalerEdition = (ouverte) => {
  const signaler = useContext(ContexteEditions)?.signaler;
  const id = useId();

  useEffect(() => {
    signaler?.(id, ouverte);
    return () => signaler?.(id, false);
  }, [signaler, id, ouverte]);
};

// Édition qui ne peut pas être ouverte en même temps qu'une autre de la même modale.
// Renvoie { ouverte, ailleurs, ouvrir, fermer, attente } : `ailleurs` vaut true quand une autre est ouverte ;
// `attente(bloque)` donne les attributs d'un bouton qui doit attendre (aria-disabled + renvoi à la note).
// Hors contexte (composant utilisé seul), l'édition est simplement locale.
export const useEditionExclusive = () => {
  const contexte = useContext(ContexteEditions);
  const id = useId();
  const [locale, setLocale] = useState(false);

  // Un composant démonté pendant son édition libère la place
  const setIdActif = contexte?.setIdActif;
  useEffect(() => () => setIdActif?.((actif) => (actif === id ? null : actif)), [setIdActif, id]);

  if (!contexte) {
    return {
      ouverte: locale,
      ailleurs: false,
      ouvrir: () => setLocale(true),
      fermer: () => setLocale(false),
      attente: () => ({}),
    };
  }
  return {
    ouverte: contexte.idActif === id,
    ailleurs: contexte.idActif !== null && contexte.idActif !== id,
    ouvrir: () => contexte.setIdActif(id),
    fermer: () => contexte.setIdActif((actif) => (actif === id ? null : actif)),
    attente: (bloque) => attributsAttente(bloque, contexte.idNote),
  };
};

// Confirmation de fermeture commune aux modales de la carte
export const CONFIRMER_ABANDON = {
  question: 'Abandonner les modifications en cours ?',
  libelleAbandon: 'Abandonner',
};

// Infobulle d'un bouton inactif pendant qu'une autre édition est ouverte
export const ATTENDRE_EDITION = 'Terminez la modification en cours';

// Attributs d'un bouton qui attend la fin d'une édition (voir Bouton : aria-disabled)
export const attributsAttente = (bloque, idNote) =>
  bloque ? { 'aria-disabled': true, 'aria-describedby': idNote, title: ATTENDRE_EDITION } : {};
