import { Truck, Store } from 'lucide-react';
import { Bouton } from '../ui/bouton';
import { BandeauMessage } from '../ui/bandeau';
import { TYPE_RETRAIT } from '../../lib/commande';

// Tuile de choix du mode de retrait : un bouton radio de grande taille
const TuileRetrait = ({ actif, icone: Icone, libelle, detail, onClick }) => (
  <button
    type="button"
    role="radio"
    aria-checked={actif}
    onClick={onClick}
    className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors ${
      actif
        ? 'border-primary bg-primary/10'
        : 'border-border bg-secondary/40 hover:border-muted-foreground/60'
    }`}
  >
    <Icone className={`h-6 w-6 ${actif ? 'text-primary' : 'text-muted-foreground'}`} aria-hidden="true" />
    <span className="mt-1 font-semibold">{libelle}</span>
    <span className="text-xs text-muted-foreground">{detail}</span>
  </button>
);

// Champ d'adresse. L'erreur s'affiche sous le champ (pas de bulle native du navigateur).
const ChampAdresse = ({ libelle, name, value, placeholder, autoComplete, inputMode, erreur, onChange }) => (
  <div>
    <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
      {libelle}
    </label>
    <input
      id={name}
      type="text"
      name={name}
      aria-required="true"
      aria-invalid={erreur ? 'true' : undefined}
      aria-describedby={erreur ? `${name}-erreur` : undefined}
      value={value}
      autoComplete={autoComplete}
      inputMode={inputMode}
      onChange={(e) => onChange(name, e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-lg border bg-background/60 px-3 py-3 text-base text-foreground transition-colors placeholder:text-muted-foreground sm:text-sm ${
        erreur ? 'border-destructive' : 'border-input focus-visible:border-primary'
      }`}
    />
    {erreur && (
      <p id={`${name}-erreur`} className="mt-1.5 text-xs font-semibold text-destructive">
        {erreur}
      </p>
    )}
  </div>
);

export const FormulaireRetrait = ({
  typeRetrait,
  onChangerType,
  adresse,
  onChangerChamp,
  onSubmit,
  chargement,
  panierVide,
  erreur,
  erreursAdresse = {},
}) => (
  <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
    <h2 className="titre-marque text-3xl">Mode de retrait</h2>

    {/* noValidate : l'adresse est verifiee par la page (lib/adresse), messages sous les champs */}
    <form id="form-commande" noValidate onSubmit={onSubmit} className="mt-4 space-y-5">
      <div role="radiogroup" aria-label="Mode de retrait" className="grid grid-cols-2 gap-3">
        <TuileRetrait
          actif={typeRetrait === TYPE_RETRAIT.CLICK_AND_COLLECT}
          icone={Store}
          libelle="Click & collect"
          detail="Au comptoir"
          onClick={() => onChangerType(TYPE_RETRAIT.CLICK_AND_COLLECT)}
        />
        <TuileRetrait
          actif={typeRetrait === TYPE_RETRAIT.LIVRAISON}
          icone={Truck}
          libelle="Livraison"
          detail="À ton adresse"
          onClick={() => onChangerType(TYPE_RETRAIT.LIVRAISON)}
        />
      </div>

      {typeRetrait === TYPE_RETRAIT.LIVRAISON ? (
        <div className="space-y-4">
          <ChampAdresse
            libelle="Adresse"
            name="cpRue"
            autoComplete="street-address"
            value={adresse.cpRue}
            placeholder="N° et nom de rue"
            erreur={erreursAdresse.cpRue}
            onChange={onChangerChamp}
          />

          <div className="grid grid-cols-2 gap-4">
            <ChampAdresse
              libelle="Code postal"
              name="cpCodePostal"
              autoComplete="postal-code"
              value={adresse.cpCodePostal}
              placeholder="5 chiffres"
              inputMode="numeric"
              erreur={erreursAdresse.cpCodePostal}
              onChange={onChangerChamp}
            />
            <ChampAdresse
              libelle="Ville"
              name="cpVille"
              autoComplete="address-level2"
              value={adresse.cpVille}
              placeholder="Ville"
              erreur={erreursAdresse.cpVille}
              onChange={onChangerChamp}
            />
          </div>
        </div>
      ) : (
        <p className="rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
          Tu récupères ta commande au comptoir dès qu’elle est prête. Un e-mail te prévient.
        </p>
      )}

      <BandeauMessage message={erreur ? { type: 'erreur', texte: erreur } : null} />

      {/* Sur mobile, le bouton est dans la barre fixe du bas (voir BarreValidationMobile) */}
      <div className="hidden md:block">
        <Bouton type="submit" taille="lg" className="w-full" disabled={chargement || panierVide}>
          {chargement ? 'Envoi de la commande…' : 'Valider et commander'}
        </Bouton>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Aucun paiement en ligne n’est demandé.
      </p>
    </form>
  </section>
);
