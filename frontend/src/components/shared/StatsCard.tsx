import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatsTone = 'primary' | 'secondary' | 'tertiary' | 'info' | 'accent' | 'success';

const NB = ' ';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  /** Précision factuelle après la valeur (jamais de tendance : l'API n'en fournit pas). */
  description?: string;
  tone?: StatsTone;
  className?: string;
}

/** Indicateur (composant « kpi » de la maquette) : pastille d'icône + libellé + valeur. */
export function StatsCard({ title, value, icon: Icon, description, tone = 'primary', className }: StatsCardProps) {
  return (
    <div className={cn('card kpi', `kpi--${tone}`, className)}>
      <span className="kpi__icon" aria-hidden="true">
        <Icon className="icon" />
      </span>
      <div className="kpi__body">
        <span className="label">{title}</span>
        <span className="value tnum">
          {value}
          {description && <small>{NB + description}</small>}
        </span>
      </div>
    </div>
  );
}
