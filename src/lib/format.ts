export const formatFCFA = (amount: number) =>
  new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";

export const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m.toString().padStart(2, "0")}`;
};