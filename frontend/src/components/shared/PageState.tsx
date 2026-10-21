import type { ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

type SkeletonVariant = 'cards' | 'list' | 'table' | 'planning' | 'stats';

interface PageStateProps {
  isLoading: boolean;
  isError: boolean;
  /** Vrai quand le chargement a réussi mais qu'il n'y a rien à afficher. */
  isEmpty?: boolean;
  /** Affiché quand isEmpty est vrai : un <EmptyState />. */
  empty?: ReactNode;
  /** Relance le chargement (bouton « Réessayer »). */
  onRetry?: () => void;
  skeleton?: SkeletonVariant;
  /** Complément de « Impossible de charger … » (ex. « votre tableau de bord »). */
  errorWhat?: string;
  children: ReactNode;
}

/** Squelettes identiques à ceux de la maquette (EPC.skeleton). */
function Skeleton({ variant }: { variant: SkeletonVariant }) {
  if (variant === 'cards') {
    return (
      <div className="course-grid" role="status" aria-busy="true">
        <span className="sr-only">Chargement en cours…</span>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="sk-card" aria-hidden="true">
            <div className="visual sk sk--block" />
            <div className="body">
              <div className="sk sk--line sk--short" />
              <div className="sk sk--title" />
              <div className="sk sk--line" />
              <div className="sk sk--line sk--short" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (variant === 'table') {
    return (
      <div className="table-wrap" role="status" aria-busy="true">
        <span className="sr-only">Chargement en cours…</span>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="sk-row" aria-hidden="true">
            {Array.from({ length: 5 }, (_, j) => (
              <div key={j} className="sk sk--line" />
            ))}
          </div>
        ))}
      </div>
    );
  }
  if (variant === 'planning') {
    return (
      <div className="card sk-stack" role="status" aria-busy="true">
        <span className="sr-only">Chargement du planning en cours…</span>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="sk sk--tall" aria-hidden="true" />
        ))}
      </div>
    );
  }
  // 'list' (et 'stats', conservé pour compatibilité) : 4 cartes
  return (
    <div className="sk-stack-list" role="status" aria-busy="true">
      <span className="sr-only">Chargement en cours…</span>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="card sk-stack" aria-hidden="true">
          <div className="sk sk--title" />
          <div className="sk sk--line" />
          <div className="sk sk--line sk--short" />
        </div>
      ))}
    </div>
  );
}

/**
 * Gère les quatre états d'une page de données : chargement (squelette), erreur (avec
 * « Réessayer »), vide, et contenu. Une panne ne ressemble jamais à « aucune donnée ».
 */
export function PageState({
  isLoading,
  isError,
  isEmpty = false,
  empty,
  onRetry,
  skeleton = 'list',
  errorWhat = 'cette page',
  children,
}: PageStateProps) {
  if (isLoading) {
    return <Skeleton variant={skeleton} />;
  }

  if (isError) {
    return (
      <div className="state state--error" role="alert">
        <span className="err-ic">
          <AlertTriangle className="icon icon--lg" aria-hidden="true" />
        </span>
        <h2>Impossible de charger {errorWhat}</h2>
        <p>Un incident technique empêche l'affichage de cette page. Vos données ne sont pas perdues. Réessayez dans un instant.</p>
        <div className="state__actions">
          {onRetry && (
            <button type="button" className="btn btn--primary" onClick={onRetry}>
              <RefreshCw className="icon" aria-hidden="true" />
              Réessayer
            </button>
          )}
          <Link className="btn btn--secondary" to="/contact">
            Contacter le support
          </Link>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return <>{empty}</>;
  }

  return <>{children}</>;
}
