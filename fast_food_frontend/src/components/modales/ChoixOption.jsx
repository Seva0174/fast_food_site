import { Check } from 'lucide-react';

export const Surcout = ({ valeur }) =>
  Number(valeur) > 0 ? (
    <span className="shrink-0 text-xs font-bold text-primary">
      +{Number(valeur).toFixed(2)} €
    </span>
  ) : null;

export const ChoixOption = ({
  libelle,
  image,
  actif,
  radio = false,
  desactive = false,
  droite,
  onClick,
}) => (
  <button
    type="button"
    role={radio ? 'radio' : 'checkbox'}
    aria-checked={actif}
    disabled={desactive}
    onClick={onClick}
    className={`flex w-full items-center justify-between gap-3 rounded-lg border p-2.5 text-left text-sm transition-colors ${
      actif
        ? 'border-primary bg-primary/10 font-medium'
        : 'border-border bg-transparent hover:border-muted-foreground/60'
    } ${desactive ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
  >
    <span className="flex min-w-0 items-center gap-3">
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
          radio ? 'rounded-full' : 'rounded-md'
        } ${
          actif
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-muted-foreground/60'
        }`}
      >
        {actif && <Check className="h-3 w-3 stroke-[3]" />}
      </span>

      {image && (
        <img
          src={image}
          alt=""
          className="h-10 w-10 shrink-0 rounded object-cover"
          onError={(e) => {
            e.currentTarget.hidden = true;
          }}
        />
      )}

      <span className="truncate">{libelle}</span>
    </span>

    {droite}
  </button>
);