import { useEffect, useState } from 'react';

const SEUIL_DESKTOP = 1024;

export const useIsDesktop = () => {
  const [estDesktop, setEstDesktop] = useState(() => window.innerWidth >= SEUIL_DESKTOP);

  useEffect(() => {
    const surRedimensionnement = () => setEstDesktop(window.innerWidth >= SEUIL_DESKTOP);
    window.addEventListener('resize', surRedimensionnement);
    return () => window.removeEventListener('resize', surRedimensionnement);
  }, []);

  return estDesktop;
};