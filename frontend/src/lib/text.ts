/** Minuscules sans accents, pour une recherche tolérante (« ecole » trouve « École »). */
export function normalizeText(text: string | null | undefined): string {
  return (text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** « 15 octobre 2026 » ; chaîne vide si la date est absente ou invalide. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value);
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
}

/** « 15 octobre 2026 à 10:30 » */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : dateTimeFormatter.format(date).replace(',', ' à');
}

export function fullName(prenom: string | null | undefined, nom: string | null | undefined): string {
  return [prenom, nom].filter(Boolean).join(' ');
}
