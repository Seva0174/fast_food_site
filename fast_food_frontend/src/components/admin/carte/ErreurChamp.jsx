// Message d'erreur sous un champ, relié au champ par aria-describedby (id).
export const ErreurChamp = ({ id, message }) =>
  message ? (
    <p id={id} className="mt-1 text-sm font-medium text-destructive">
      {message}
    </p>
  ) : null;
