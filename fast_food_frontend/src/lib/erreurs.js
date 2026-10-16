// Message d'erreur renvoye par l'API (champ "messages" ou "message"), ou null s'il n'y en a pas.
export const extraireMessageErreur = (erreur) => {
  const data = erreur?.response?.data;
  if (Array.isArray(data?.messages)) return data.messages.join(' | ');
  return data?.message || null;
};