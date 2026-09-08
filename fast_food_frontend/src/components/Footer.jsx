export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm">
        <p>© {new Date().getFullYear()} FastFood. Tous droits réservés.</p>
        <p className="mt-1 text-xs text-gray-500">Livraison à domicile uniquement</p>
      </div>
    </footer>
  );
};