import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Liste déroulante. Les options se décrivent par { value, label }.
// Pour un classement par rubriques, passer `groupes` ([{ libelle, options }]) à la place de `options`.
export const ListeDeroulante = ({
  valeur,
  onChange,
  options = [],
  groupes,
  placeholder,
  className = '',
  classeItem = 'text-sm',
}) => {
  const rendreOption = (option) => (
    <SelectItem key={option.value} value={String(option.value)} className={classeItem}>
      {option.label}
    </SelectItem>
  );

  return (
    <Select value={valeur ? String(valeur) : ''} onValueChange={onChange}>
      <SelectTrigger className={`h-auto ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="z-[60]">
        {groupes
          ? groupes.map((groupe) => (
              <SelectGroup key={groupe.libelle}>
                <SelectLabel className="text-[10px] uppercase text-gray-500">{groupe.libelle}</SelectLabel>
                {groupe.options.map(rendreOption)}
              </SelectGroup>
            ))
          : options.map(rendreOption)}
      </SelectContent>
    </Select>
  );
};