import { useState } from 'react';
import { ImageOff, Image as ImageIcon } from 'lucide-react';

// Vignette d'un produit. Une image absente ou illisible est remplacée par une icône.
// taille : classes de dimension (vignette du tableau par défaut).
// Une adresse qui ne charge pas montre une image barrée ; onErreur reçoit cette adresse.
export const ImageProduit = ({ url, alt, taille = 'size-12', onErreur }) => {
  // Mémorise l'adresse en échec : une nouvelle adresse est de nouveau essayée
  const [urlEnEchec, setUrlEnEchec] = useState(null);

  if (url && url !== urlEnEchec) {
    return (
      <img
        src={url}
        alt={alt}
        className={`${taille} shrink-0 rounded-lg border border-border object-cover`}
        onError={() => {
          setUrlEnEchec(url);
          onErreur?.(url);
        }}
      />
    );
  }

  const enEchec = Boolean(url);
  const Icone = enEchec ? ImageOff : ImageIcon;

  return (
    <div
      title={enEchec ? 'Image introuvable' : 'Sans image'}
      className={`${taille} flex shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground`}
    >
      <Icone className="h-5 w-5" aria-hidden="true" />
      {/* Dans le tableau (alt vide), la vignette est décorative : rien n'est lu dans l'en-tête de ligne */}
      {enEchec && alt && <span className="sr-only">Image introuvable</span>}
    </div>
  );
};
