import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Boutons d'action principaux de la page, à droite (classes .btn de la maquette). */
  actions?: ReactNode;
}

/** Titre de page (composant « app-title » de la maquette). */
export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="app-title">
      <div>
        <h1 className="text-h1" tabIndex={-1}>
          {title}
        </h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
