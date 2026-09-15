import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm">
        <p>© {new Date().getFullYear()} FastFood. Tous droits réservés.</p>

        <p className="mt-1 text-xs text-gray-500">
          Livraison à domicile et click & collect
        </p>

        <p className="mt-2">
          Contact :{" "}
          <a
            href="mailto:admin123@gmail.com"
            className="text-white hover:underline"
          >
            admin123@gmail.com
          </a>
        </p>

        <div className="mt-3 text-xs">
          <Link to="/mentions-legales">Mentions légales</Link>
        </div>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="hover:underline"
        >
          Retour en haut
        </button>
      </div>
    </footer>
  );
};