export const erreurPeriode = (debut, fin) =>
  debut && fin && fin < debut ? 'La date de fin doit être postérieure à la date de début.' : null;