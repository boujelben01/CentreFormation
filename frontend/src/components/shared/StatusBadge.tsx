import { CheckCircle2, Clock, HelpCircle, XCircle, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { inscriptionStatut } from '@/lib/labels';

const STATUS_ICONS: Record<string, LucideIcon> = {
  INSCRIT: CheckCircle2,
  EN_ATTENTE: Clock,
  ANNULE: XCircle,
};

const BADGE_TONE = {
  success: 'badge--success',
  warning: 'badge--warning',
  danger: 'badge--danger',
  info: 'badge--info',
  primary: 'badge--primary',
  teal: 'badge--secondary',
  neutral: '',
} as const;

interface StatusBadgeProps {
  /** Valeur brute de l'API : INSCRIT, EN_ATTENTE ou ANNULE. */
  status?: string | null;
  className?: string;
}

/** Statut d'inscription : libellé français + icône (la couleur ne porte jamais seule l'information). */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, tone } = inscriptionStatut(status);
  const Icon = (status && STATUS_ICONS[status]) || HelpCircle;

  return (
    <span className={cn('badge', BADGE_TONE[tone], className)}>
      <Icon className="icon icon--sm" aria-hidden="true" />
      {label}
    </span>
  );
}
