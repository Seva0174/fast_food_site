import { PageArret } from '@/components/layout/PageArret';

// Toute adresse qui ne correspond à aucune route (voir App.jsx).
export const PageIntrouvable = () => (
  <PageArret
    titre="Page introuvable"
    texte="Cette adresse ne mène nulle part. La carte, elle, est toujours là."
    lien={{ to: '/', libelle: 'Voir la carte' }}
  />
);
