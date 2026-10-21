import { Link } from 'react-router-dom';

/** Logo + mot-symbole « EduPortal » (composant « wordmark » de la maquette). */
export function Brand({ to = '/', label = 'EduPortal, retour au site', onClick }: { to?: string; label?: string; onClick?: () => void }) {
  return (
    <Link className="brand" to={to} aria-label={label} onClick={onClick}>
      <svg className="logo" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="var(--primary)" />
        <path d="M9 24V15a7 7 0 0 1 14 0v9" fill="none" stroke="var(--primary-contrast)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="16" cy="16" r="2.5" fill="var(--accent)" />
      </svg>
      <span className="wordmark">
        <b>Edu</b>
        <span>Portal</span>
      </span>
    </Link>
  );
}
