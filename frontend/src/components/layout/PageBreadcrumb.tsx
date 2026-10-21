import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_SHELL, pageTitleFor } from './navConfig';

/** Fil d'Ariane (composant « breadcrumb » de la maquette) : Accueil > Espace … > Titre de la page. */
export function PageBreadcrumb() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const role = user?.role ?? 'ETUDIANT';
  const shell = ROLE_SHELL[role];
  const title = pageTitleFor(role, pathname);

  return (
    <nav className="breadcrumb" aria-label="Fil d'Ariane">
      <ol>
        <li>
          <Link to="/">Accueil</Link>
        </li>
        <li>{title ? <Link to={shell.home}>{shell.space}</Link> : <span aria-current="page">{shell.space}</span>}</li>
        {title && (
          <li>
            <span aria-current="page">{title}</span>
          </li>
        )}
      </ol>
    </nav>
  );
}
