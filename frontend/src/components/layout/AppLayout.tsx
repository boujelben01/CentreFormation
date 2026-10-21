import { useCallback, useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { useIsDesktop } from '@/hooks/use-mobile';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { PageBreadcrumb } from './PageBreadcrumb';
import { ROLE_SHELL, pageTitleFor } from './navConfig';

const COLLAPSED_KEY = 'ep-sidebar-collapsed';

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

/** Coquille des espaces connectés (« app-shell » de la maquette) : menu latéral, barre supérieure, contenu, pied de page. */
export function AppLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const isDesktop = useIsDesktop();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);

  const role = user?.role ?? 'ETUDIANT';
  const shell = ROLE_SHELL[role];

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Le tiroir se ferme à chaque navigation et dès que l'écran est assez large pour le menu fixe.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, isDesktop]);

  // Voile du tiroir : affiché avant la transition d'opacité, retiré après.
  useEffect(() => {
    if (mobileOpen) {
      const frame = requestAnimationFrame(() => setOverlayVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    setOverlayVisible(false);
  }, [mobileOpen]);

  useEffect(() => {
    const title = pageTitleFor(role, pathname);
    document.title = title ? `${title} — EduPortal` : `${shell.space} — EduPortal`;
  }, [role, pathname, shell.space]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0');
      } catch {
        // stockage indisponible : le choix vaut pour la session
      }
      return next;
    });
  };

  return (
    <NotificationsProvider>
      <a className="skip-link" href="#main">
        Aller au contenu principal
      </a>
      <div className={collapsed ? 'app is-collapsed' : 'app'} id="app">
        <Sidebar open={mobileOpen} onClose={closeMobile} />
        <div
          className={overlayVisible ? 'sidebar-overlay is-open' : 'sidebar-overlay'}
          id="sidebar-overlay"
          hidden={!mobileOpen}
          onClick={closeMobile}
        />
        <div className="app-body">
          <Topbar
            collapsed={collapsed}
            mobileOpen={mobileOpen}
            onToggleCollapsed={toggleCollapsed}
            onOpenMobile={() => setMobileOpen(true)}
          />
          <main id="main" className="app-main" tabIndex={-1}>
            <PageBreadcrumb />
            <Outlet />
          </main>
          <footer className="app-footer">
            <span>© 2026 EduPortal — {shell.space}</span>
            <span>
              <Link className="link-inline" to="/contact">
                Besoin d'aide&nbsp;?
              </Link>{' '}
              ·{' '}
              <Link className="link-inline" to="/mentions-legales">
                Mentions légales
              </Link>
            </span>
          </footer>
        </div>
      </div>
    </NotificationsProvider>
  );
}
