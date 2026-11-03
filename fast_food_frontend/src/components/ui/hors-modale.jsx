import { createPortal } from 'react-dom';

// Rend son contenu à la racine de la page. Une confirmation ou un message posé dans une modale serait
// positionné par rapport à elle (la modale est transformée et rogne ce qui dépasse) : il doit en sortir.
export const HorsModale = ({ children }) => createPortal(children, document.body);
