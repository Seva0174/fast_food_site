import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Liste déroulante. Les options se décrivent par { value, label, description } (description facultative).
// Pour un classement par rubriques, passer `groupes` ([{ libelle, options }]) à la place de `options`.
export const ListeDeroulante = ({
  valeur,
  onChange,
  options = [],
  groupes,
  placeholder,
  className = '',
  classeItem = 'text-sm',
  // id : relie la liste à son <label htmlFor> ; ariaLabel : nom accessible sans label visible
  id,
  ariaLabel,
  // invalide / ariaDescribedby : relie la liste à son message d'erreur
  invalide = false,
  ariaDescribedby,
}) => {
  const rendreOption = (option) => (
    <SelectItem
      key={option.value}
      value={String(option.value)}
      description={option.description}
      className={classeItem}
    >
      {option.label}
    </SelectItem>
  );

  return (
    <Select value={valeur ? String(valeur) : ''} onValueChange={onChange}>
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        aria-invalid={invalide || undefined}
        aria-describedby={ariaDescribedby}
        className={`h-auto ${className}`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="z-[60]">
        {groupes
          ? groupes.map((groupe) => (
              <SelectGroup key={groupe.libelle}>
                <SelectLabel className="text-xs font-semibold text-muted-foreground">{groupe.libelle}</SelectLabel>
                {groupe.options.map(rendreOption)}
              </SelectGroup>
            ))
          : options.map(rendreOption)}
      </SelectContent>
    </Select>
  );
};