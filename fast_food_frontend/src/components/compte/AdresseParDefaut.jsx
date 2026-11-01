import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Bouton } from '../ui/bouton';
import { useMessage } from '../../hooks/useMessage';
import {
  adresseVersCommande,
  enregistrerAdresse,
  lireAdresseEnregistree,
  verifierAdresse,
} from '../../lib/adresse';

const ADRESSE_VIDE = { rue: '', ville: '', codePostal: '' };

// Champs du compte ({ rue, codePostal, ville }) et cle correspondante de verifierAdresse
const CHAMPS = [
  { nom: 'rue', cle: 'cpRue', libelle: 'Rue', placeholder: 'N° et nom de rue', autoComplete: 'street-address', pleine: true },
  { nom: 'codePostal', cle: 'cpCodePostal', libelle: 'Code postal', placeholder: '5 chiffres', autoComplete: 'postal-code', inputMode: 'numeric' },
  { nom: 'ville', cle: 'cpVille', libelle: 'Ville', placeholder: 'Ville', autoComplete: 'address-level2' },
];

// Adresse proposee par defaut a la commande. Elle est stockee dans ce navigateur (lib/adresse).
export const AdresseParDefaut = ({ idUser }) => {
  const [adresse, setAdresse] = useState(() => lireAdresseEnregistree(idUser) ?? ADRESSE_VIDE);
  const [erreurs, setErreurs] = useState({});
  const { message, afficher } = useMessage(4000);

  const modifier = (nom, cle, valeur) => {
    setAdresse((prev) => ({ ...prev, [nom]: valeur }));
    setErreurs((prev) => ({ ...prev, [cle]: undefined }));
  };

  const enregistrer = (e) => {
    e.preventDefault();
    const trouvees = verifierAdresse(adresseVersCommande(adresse));
    setErreurs(trouvees);
    const premier = CHAMPS.find((champ) => trouvees[champ.cle]);
    if (premier) {
      document.getElementById(`adresse-${premier.nom}`)?.focus();
      return;
    }
    enregistrerAdresse(idUser, adresse);
    afficher('Adresse enregistrée.');
  };

  return (
    <form noValidate onSubmit={enregistrer} className="rounded-2xl border border-border bg-card p-5">
      <h2 className="titre-marque text-2xl">Adresse de livraison</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Proposée par défaut à la commande. Enregistrée sur cet appareil uniquement.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {CHAMPS.map((champ) => {
          const id = `adresse-${champ.nom}`;
          const erreur = erreurs[champ.cle];
          return (
            <div key={champ.nom} className={champ.pleine ? 'col-span-2' : ''}>
              <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
                {champ.libelle}
              </label>
              <input
                id={id}
                type="text"
                value={adresse[champ.nom] ?? ''}
                placeholder={champ.placeholder}
                autoComplete={champ.autoComplete}
                inputMode={champ.inputMode}
                aria-invalid={erreur ? 'true' : undefined}
                aria-describedby={erreur ? `${id}-erreur` : undefined}
                onChange={(e) => modifier(champ.nom, champ.cle, e.target.value)}
                className={`w-full rounded-lg border bg-background/60 px-3 py-3 text-base text-foreground transition-colors placeholder:text-muted-foreground sm:text-sm ${
                  erreur ? 'border-destructive' : 'border-input focus-visible:border-primary'
                }`}
              />
              {erreur && (
                <p id={`${id}-erreur`} className="mt-1.5 text-xs font-semibold text-destructive">
                  {erreur}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <Bouton type="submit" variante="secondaire" className="mt-4 w-full">
        Enregistrer l’adresse
      </Bouton>

      <p role="status" className="mt-2 flex min-h-5 items-center justify-center gap-1.5 text-xs text-muted-foreground">
        {message && (
          <>
            <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
            {message.texte}
          </>
        )}
      </p>
    </form>
  );
};
