const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';

const variantes = {
  principal: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
  secondaire: 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
  danger: 'bg-red-50 text-red-600 hover:bg-red-100',
  fantome: 'text-gray-500 hover:bg-gray-100 hover:text-gray-800',
  succes: 'bg-green-600 text-white shadow-sm hover:bg-green-700',
  neutre: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  lien: 'text-red-600 hover:underline',
  discret: 'text-gray-400 hover:underline',
  sombre: 'bg-gray-900 text-white hover:bg-black',
  info: 'bg-blue-600 text-white shadow-sm hover:bg-blue-700',
  contour: 'border border-red-200 bg-white text-red-600 hover:border-red-300 hover:text-red-700',
  lienInfo: 'text-blue-600 hover:underline',
  succesDoux: 'bg-green-100 text-green-700 hover:bg-green-200',
  dangerDoux: 'bg-red-100 text-red-700 hover:bg-red-200',
  contourInfo: 'border border-blue-200 text-blue-600 hover:border-blue-400 hover:text-blue-800',
  contourAccent: 'border border-purple-200 text-purple-600 hover:border-purple-400 hover:text-purple-800',
};

const tailles = {
  xs: 'px-2.5 py-1 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-4 py-3.5 text-base',
  icone: 'rounded-full p-1',
  iconeCarree: 'p-1.5',
  pastille: 'rounded-full px-3 py-1 text-xs',
  nu: '',
};

export const Bouton = ({
  variante = 'principal',
  taille = 'md',
  className = '',
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    className={`${base} ${variantes[variante]} ${tailles[taille]} ${className}`}
    {...props}
  />
);