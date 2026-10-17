import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Liste déroulante simple. Les options se décrivent par { value, label }.
export const ListeDeroulante = ({
  valeur,
  onChange,
  options,
  placeholder,
  className = '',
  classeItem = 'text-sm',
}) => (
  <Select value={valeur ? String(valeur) : ''} onValueChange={onChange}>
    <SelectTrigger className={`h-auto ${className}`}>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent className="z-[60]">
      {options.map((option) => (
        <SelectItem key={option.value} value={String(option.value)} className={classeItem}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);