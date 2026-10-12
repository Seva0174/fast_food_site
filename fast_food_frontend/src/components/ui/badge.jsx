// Les classes de padding et de couleur se passent via className.
export const Badge = ({ children, className = '' }) => (
  <span
    className={`inline-flex items-center rounded-full bg-red-600 text-xs font-bold text-white ${className}`}
  >
    {children}
  </span>
);