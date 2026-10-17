import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Bouton } from '@/components/ui/bouton';

// Import d'un catalogue fournisseur au format CSV (nom_matiere;prix_unitaire).
export const ImportCatalogue = ({ chargement, onImporter }) => {
  const [fichier, setFichier] = useState(null);

  const soumettre = async (e) => {
    e.preventDefault();
    const formulaire = e.currentTarget;
    if (await onImporter(fichier)) {
      setFichier(null);
      formulaire.reset();
    }
  };

  return (
    <form onSubmit={soumettre} className="flex items-center gap-2">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFichier(e.target.files[0] ?? null)}
        className="text-xs text-gray-500 file:mr-2 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-gray-700 hover:file:bg-gray-200"
      />
      <Bouton type="submit" variante="sombre" taille="xs" disabled={!fichier || chargement}>
        <Upload className="h-3.5 w-3.5" /> Import CSV
      </Bouton>
    </form>
  );
};