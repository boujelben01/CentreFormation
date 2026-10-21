import { Award, Check, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNote, noteLevel } from '@/lib/notes';

const NB = ' ';

const LEVEL_ICONS = {
  award: Award,
  'check-circle': CheckCircle2,
  check: Check,
  'alert-triangle': AlertTriangle,
} as const;

/** Note sur 20 : texte en gras, chiffres tabulaires (composant « note » de la maquette). */
export function NoteBadge({ value, className }: { value: number; className?: string }) {
  const level = noteLevel(value);
  return (
    <span className={cn('note tnum', className)}>
      {formatNote(value)}
      {NB}/{NB}20
      <span className="sr-only"> ({level.label})</span>
    </span>
  );
}

/** Niveau de la note (Excellent, Très bien, Réussi, À améliorer) : badge avec icône, règle unique de seuils. */
export function NoteLevelBadge({ value, className }: { value: number; className?: string }) {
  const level = noteLevel(value);
  const Icon = LEVEL_ICONS[level.icon];
  return (
    <span className={cn('badge', `badge--${level.tone}`, className)}>
      <Icon className="icon icon--sm" aria-hidden="true" />
      {level.label}
    </span>
  );
}
