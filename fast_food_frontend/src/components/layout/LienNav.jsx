import { Link } from 'react-router-dom';

// Lien de navigation utilise en bureau et en mobile.
export const LienNav = ({
  to,
  icone: Icone,
  couleur = 'text-gray-700 hover:text-red-600',
  mobile = false,
  onClick,
  children,
}) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-1 font-medium ${couleur} ${mobile ? 'py-2' : ''}`}
  >
    {Icone && <Icone className="h-4 w-4" />}
    {children}
  </Link>
);