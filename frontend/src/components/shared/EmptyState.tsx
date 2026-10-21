import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Search } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** Action(s) proposée(s) : boutons ou liens (classes .btn). */
  action?: ReactNode;
  className?: string;
}

/** État vide (composant « empty-state » de la maquette) : illustration, titre, texte, actions. */
export function EmptyState({ title, description, icon: Icon = Search, action, className }: EmptyStateProps) {
  return (
    <div className={`state ${className ?? ''}`.trim()} role="status">
      <svg className="art" viewBox="0 0 160 120" aria-hidden="true">
        <ellipse cx="80" cy="108" rx="50" ry="7" fill="var(--surface-sunken)" />
        <circle cx="80" cy="56" r="42" fill="var(--primary-soft)" stroke="var(--primary-border)" />
        <g transform="translate(52 28)" style={{ color: 'var(--primary)' }}>
          <Icon width={56} height={56} strokeWidth={1.8} aria-hidden="true" />
        </g>
        <circle cx="128" cy="24" r="6" fill="var(--accent)" />
      </svg>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {action && <div className="state__actions">{action}</div>}
    </div>
  );
}
