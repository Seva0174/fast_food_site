import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

// Vignette d'un produit. Une image absente ou illisible est remplacée par une icône.
export const ImageProduit = ({ url, alt }) => {
  // Mémorise l'adresse en échec : une nouvelle adresse est de nouveau essayée
  const [urlEnEchec, setUrlEnEchec] = useState(null);

  if (url && url !== urlEnEchec) {
    return (
      <img
        src={url}
        alt={alt}
        className="h-12 w-12 rounded border object-cover"
        onError={() => setUrlEnEchec(url)}
      />
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded border bg-gray-100 text-gray-400">
      <ImageIcon className="h-6 w-6" />
    </div>
  );
};