import { NavLink } from 'react-router-dom';

// Lien de navigation utilise en bureau et en mobile.
// Le lien de la page courante est souligne en creme : l'orange reste reserve a la commande.
// "couleur" permet de forcer une couleur (usage ponctuel).
export const LienNav = ({ to, icone: Icone, couleur, mobile = false, onClick, children }) => (
  <NavLink
    to={to}
    end={to === '/'}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-1.5 font-medium transition-colors ${
        couleur ??
        (isActive
          ? 'text-foreground underline decoration-2 underline-offset-8'
          : 'text-foreground/80 hover:text-foreground')
      } ${mobile ? 'py-2' : ''}`
    }
  >
    {Icone && <Icone className="h-4 w-4" />}
    {children}
  </NavLink>
);