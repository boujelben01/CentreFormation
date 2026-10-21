import type { ReactNode } from 'react';
import { CheckCircle } from 'lucide-react';
import { HeroArt } from '@/components/shared/HeroArt';

interface AuthShellProps {
  eyebrow: string;
  title: string;
  /** Arguments du panneau latéral : uniquement des faits vrais pour ce projet. */
  points: string[];
  /** La carte `.auth-card`. */
  children: ReactNode;
}

/** Mise en page des pages de connexion et d'inscription (composants « auth » et « auth-aside » de la maquette). */
export function AuthShell({ eyebrow, title, points, children }: AuthShellProps) {
  return (
    <div className="container auth">
      <div className="auth__grid">
        <div className="auth__aside">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="text-h1">{title}</h2>
          <ul>
            {points.map((point) => (
              <li key={point}>
                <CheckCircle className="icon" aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <HeroArt className="auth__art" />
        </div>
        {children}
      </div>
    </div>
  );
}
