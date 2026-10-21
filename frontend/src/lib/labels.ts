// Libellés français des valeurs brutes renvoyées par l'API (enums Java).

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary' | 'teal';

/** Classes Tailwind (tokens) d'un badge doux selon son ton. */
export const TONE_CLASSES: Record<Tone, string> = {
  success: 'bg-success-bg text-success-text border-success-border',
  warning: 'bg-warning-bg text-warning-text border-warning-border',
  danger: 'bg-danger-bg text-danger-text border-danger-border',
  info: 'bg-info-bg text-info-text border-info-border',
  neutral: 'bg-muted text-muted-foreground border-border',
  primary: 'bg-primary-soft text-primary-soft-text border-primary/30',
  teal: 'bg-teal-bg text-teal-text border-teal-border',
};

interface LabelEntry {
  label: string;
  tone: Tone;
}

/** Inscription.Statut */
const INSCRIPTION_STATUTS: Record<string, LabelEntry> = {
  INSCRIT: { label: 'Inscrit', tone: 'success' },
  EN_ATTENTE: { label: 'En attente', tone: 'warning' },
  ANNULE: { label: 'Annulé', tone: 'neutral' },
};

/** Notification.Type */
const NOTIFICATION_TYPES: Record<string, string> = {
  EMAIL: 'E-mail',
  SYSTEM: 'Système',
};

/** Notification.Statut */
const NOTIFICATION_STATUTS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  ENVOYE: 'Envoyée',
  ECHEC: 'Échec',
};

/** « UNE_VALEUR_INCONNUE » devient « Une valeur inconnue » : jamais de constante brute à l'écran. */
function humanize(raw: string): string {
  const text = raw.replace(/_/g, ' ').toLowerCase().trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function inscriptionStatut(raw?: string | null): LabelEntry {
  if (!raw) return { label: 'Inconnu', tone: 'neutral' };
  return INSCRIPTION_STATUTS[raw] ?? { label: humanize(raw), tone: 'neutral' };
}

export function notificationTypeLabel(raw?: string | null): string {
  if (!raw) return '';
  return NOTIFICATION_TYPES[raw] ?? humanize(raw);
}

export function notificationStatutLabel(raw?: string | null): string {
  if (!raw) return '';
  return NOTIFICATION_STATUTS[raw] ?? humanize(raw);
}
