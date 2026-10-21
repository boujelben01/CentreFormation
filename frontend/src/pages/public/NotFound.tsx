import { Link } from 'react-router-dom';
import { usePageTitle } from '@/hooks/use-page-title';

/** Page introuvable du site public (maquette public/404.html). */
const NotFound = () => {
  usePageTitle('Page introuvable');
  return (
    <div className="container">
      <div className="nf">
        <svg className="art" width="160" height="120" viewBox="0 0 160 120" aria-hidden="true">
          <ellipse cx="80" cy="108" rx="52" ry="7" fill="var(--surface-sunken)" />
          <circle cx="80" cy="56" r="42" fill="var(--primary-soft)" stroke="var(--primary-border)" />
          <path d="M62 72c6-14 30-14 36 0" fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="66" cy="48" r="4" fill="var(--primary)" />
          <circle cx="94" cy="48" r="4" fill="var(--primary)" />
          <circle cx="130" cy="26" r="6" fill="var(--accent)" />
        </svg>
        <p className="code" aria-hidden="true">
          404
        </p>
        <h1 tabIndex={-1}>Cette page est introuvable</h1>
        <p>L'adresse saisie n'existe pas ou la page a été déplacée. Revenez à l'accueil ou parcourez nos formations.</p>
        <div className="state__actions">
          <Link className="btn btn--primary btn--lg" to="/">
            Retour à l'accueil
          </Link>
          <Link className="btn btn--secondary btn--lg" to="/formations">
            Voir les formations
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
