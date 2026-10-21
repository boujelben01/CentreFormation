import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Filet de sécurité global : une erreur de rendu n'affiche plus une page blanche.
 * Le repli n'utilise ni routeur ni contexte (il doit fonctionner même si ceux-ci ont planté).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erreur de rendu non gérée :', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div role="alert" className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-card">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-bg-strong text-danger-text">
            <AlertTriangle size={24} aria-hidden="true" />
          </span>
          <h1 className="font-display text-xl font-bold text-foreground">Une erreur est survenue</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            L'affichage de cette page a échoué. Vos données ne sont pas perdues : rechargez la page pour continuer.
          </p>
          {import.meta.env.DEV && (
            <pre className="mt-4 max-h-32 overflow-auto rounded-md bg-muted p-3 text-left text-xs">
              {this.state.error.message}
            </pre>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Recharger la page
            </button>
            <a
              href="/"
              className="inline-flex h-10 items-center rounded-md border border-input px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    );
  }
}
