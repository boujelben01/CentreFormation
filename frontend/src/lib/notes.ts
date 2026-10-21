import type { Tone } from './labels';

export type NoteLevelKey = 'excellent' | 'tres-bien' | 'reussi' | 'a-ameliorer';

export interface NoteLevel {
  key: NoteLevelKey;
  label: string;
  tone: Tone;
  /** Nom de l'icône Lucide du badge (comme la maquette). */
  icon: 'award' | 'check-circle' | 'check' | 'alert-triangle';
}

/**
 * Règle unique de seuils (note sur 20) :
 * ≥ 16 excellent, ≥ 14 très bien, ≥ 10 réussi, sinon à améliorer.
 */
export function noteLevel(value: number): NoteLevel {
  if (value >= 16) return { key: 'excellent', label: 'Excellent', tone: 'success', icon: 'award' };
  if (value >= 14) return { key: 'tres-bien', label: 'Très bien', tone: 'primary', icon: 'check-circle' };
  if (value >= 10) return { key: 'reussi', label: 'Réussi', tone: 'warning', icon: 'check' };
  return { key: 'a-ameliorer', label: 'À améliorer', tone: 'danger', icon: 'alert-triangle' };
}

const integerFormatter = new Intl.NumberFormat('fr-FR');
const oneDecimalFormatter = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const twoDecimalFormatter = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** « 14 » ou « 13,5 » (entier sans décimale, sinon une décimale). */
export function formatNote(value: number): string {
  return Number.isInteger(value) ? integerFormatter.format(value) : oneDecimalFormatter.format(value);
}

/** « 13,80 » : moyenne à deux décimales. */
export function formatAverage(value: number): string {
  return twoDecimalFormatter.format(value);
}

/** Moyenne simple (l'API ne fournit aucun coefficient) ; null s'il n'y a aucune note. */
export function simpleAverage(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
