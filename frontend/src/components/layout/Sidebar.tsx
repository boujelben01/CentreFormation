import { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { ExternalLink, X } from 'lucide-react';
import { Brand } from '@/components/shared/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { PUBLIC_SITE_URL, ROLE_SHELL } from './navConfig';

interface SidebarProps {
  /** Tiroir mobile ouvert. */
  open: boolean;
  onClose: () => void;
}

/**
 * Menu latéral (composant « sidebar » de la maquette). Sur ordinateur il est fixe (replié ou non
 * via la classe .is-collapsed de .app) ; en dessous de 1024 px il devient un tiroir avec piège de
 * focus, fermeture par Échap et retour du focus au bouton qui l'a ouvert.
 */
export function Sidebar({ open, onClose }: SidebarProps) {
  const { user } = useAuth();
  const shell = ROLE_SHELL[user?.role ?? 'ETUDIANT'];
  const ref = useRef<HTMLElement>(null);

  useFocusTrap(ref, open, onClose);

  return (
    <aside
      ref={ref}
      id="sidebar"
      className={open ? 'sidebar is-open' : 'sidebar'}
      aria-label={`Menu de l'${shell.space.toLowerCase()}`}
      role={open ? 'dialog' : undefined}
      aria-modal={open ? true : undefined}
    >
      <div className="sidebar__head">
        <Brand to="/" onClick={open ? onClose : undefined} />
        <button
          type="button"
          className="icon-btn"
          id="sidebar-close"
          aria-label="Fermer le menu"
          style={{ display: open ? '' : 'none' }}
          onClick={onClose}
        >
          <X className="icon" aria-hidden="true" />
        </button>
      </div>

      <nav aria-label={shell.space}>
        <p className="sidebar__group" id="sg-1">
          Mon espace
        </p>
        <ul aria-labelledby="sg-1">
          {shell.items.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end} className="side-link" title={item.label} onClick={open ? onClose : undefined}>
                <item.icon className="icon" aria-hidden="true" />
                <span className="side-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__foot">
        <a
          className="side-link side-link--ext"
          id="site-link"
          href={PUBLIC_SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="Voir le site public (nouvel onglet)"
        >
          <ExternalLink className="icon" aria-hidden="true" />
          <span className="side-label">Voir le site public</span>
          <span className="sr-only"> (nouvel onglet)</span>
        </a>
      </div>
    </aside>
  );
}
