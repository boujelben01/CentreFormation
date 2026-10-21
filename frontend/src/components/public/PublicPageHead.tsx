import { Link } from 'react-router-dom';

interface Crumb {
  label: string;
  /** Absent pour la page courante. */
  to?: string;
}

/** Fil d'Ariane des pages publiques : « Accueil » puis les maillons fournis (le dernier est la page courante). */
export function PublicBreadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="breadcrumb" aria-label="Fil d'Ariane">
      <ol>
        <li>
          <Link to="/">Accueil</Link>
        </li>
        {items.map((item) => (
          <li key={item.label}>
            {item.to ? (
              <Link to={item.to}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** En-tête de page publique (composant « page-head » de la maquette) : fil d'Ariane, titre, texte. */
export function PublicPageHead({ crumbs, title, text }: { crumbs: Crumb[]; title: string; text?: string }) {
  return (
    <div className="page-head">
      <PublicBreadcrumb items={crumbs} />
      <h1 tabIndex={-1}>{title}</h1>
      {text && <p>{text}</p>}
    </div>
  );
}
