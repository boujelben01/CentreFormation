import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUp, BookOpen, GraduationCap, Home, Info, Mail, Menu, Moon, Sun, X, type LucideIcon } from 'lucide-react';
import { Brand } from '@/components/shared/Logo';
import { ROLE_SHELL } from '@/components/layout/navConfig';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { CATEGORY_LABELS, type CategoryId } from '@/lib/courseTheme';

const NAV: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/formations', label: 'Formations', icon: BookOpen },
  { to: '/faq', label: 'Questions fréquentes', icon: Info },
  { to: '/contact', label: 'Contact', icon: Mail },
];

const DRAWER_MS = 250;
const WIDE_QUERY = '(min-width: 900px)';

function reduceMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Coquille du site public (« EPC.siteShell » de la maquette) : lien d'évitement, en-tête collant,
 * tiroir mobile, contenu, pied de page. Un visiteur connecté garde le site public avec un lien vers son espace.
 */
export function PublicLayout() {
  const { isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const isDark = theme === 'dark';
  const space = isAuthenticated && user ? ROLE_SHELL[user.role].home : null;

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const openDrawer = () => {
    setMounted(true);
    setOpen(true);
  };
  const closeDrawer = useCallback(() => setOpen(false), []);

  useFocusTrap(panelRef, open, closeDrawer, 'button');

  // Animation d'ouverture / de fermeture : le tiroir reste monté le temps de la transition.
  useEffect(() => {
    if (open) {
      const frame = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(frame);
    }
    setShown(false);
    const timer = window.setTimeout(() => setMounted(false), reduceMotion() ? 0 : DRAWER_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  // Le tiroir se ferme à chaque navigation et dès que l'écran est assez large pour le menu en ligne.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mql = window.matchMedia(WIDE_QUERY);
    const onChange = () => {
      if (mql.matches) setOpen(false);
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // Navigation interne : retour en haut et focus sur le contenu (pas au premier affichage).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY >= 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const backToTop = () => {
    window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
    document.getElementById('main')?.focus({ preventScroll: true });
  };

  return (
    <div className="site">
      <a className="skip-link" href="#main">
        Aller au contenu principal
      </a>

      <header className="site-header">
        <div className="container">
          <button
            type="button"
            className="icon-btn burger"
            id="burger"
            aria-label="Ouvrir le menu"
            aria-expanded={open}
            aria-controls="site-drawer"
            onClick={() => (open ? closeDrawer() : openDrawer())}
          >
            <Menu className="icon" aria-hidden="true" />
          </button>
          <Brand />
          <nav className="site-nav" aria-label="Navigation principale">
            <ul>
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink className="nav-link" to={item.to}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="header-actions">
            <button
              type="button"
              className="icon-btn"
              aria-label={isDark ? 'Passer au thème clair' : 'Passer au thème sombre'}
              onClick={toggleTheme}
            >
              {isDark ? <Sun className="icon" aria-hidden="true" /> : <Moon className="icon" aria-hidden="true" />}
            </button>
            {space ? (
              <Link className="btn btn--primary btn-label-desktop" to={space}>
                Mon espace
              </Link>
            ) : (
              <>
                <Link className="btn btn--ghost btn-label-desktop" to="/login">
                  Connexion
                </Link>
                <Link className="btn btn--primary btn-label-desktop" to="/register">
                  Créer un compte
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {mounted && (
        <div className={shown ? 'drawer is-open' : 'drawer'} id="site-drawer">
          <div className="drawer__overlay" onClick={closeDrawer} />
          <div ref={panelRef} className="drawer__panel" role="dialog" aria-modal="true" aria-label="Menu principal">
            <div className="drawer__head">
              <Brand />
              <button type="button" className="icon-btn" aria-label="Fermer le menu" onClick={closeDrawer}>
                <X className="icon" aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Navigation mobile">
              <ul className="drawer__nav">
                <li>
                  <NavLink className="nav-link" to="/" end>
                    <Home className="icon" aria-hidden="true" />
                    Accueil
                  </NavLink>
                </li>
                {NAV.map((item) => (
                  <li key={item.to}>
                    <NavLink className="nav-link" to={item.to}>
                      <item.icon className="icon" aria-hidden="true" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
                {space && (
                  <li>
                    <Link className="nav-link" to={space}>
                      <GraduationCap className="icon" aria-hidden="true" />
                      Mon espace
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
            <div className="drawer__foot">
              {!space && (
                <>
                  <Link className="btn btn--primary btn--lg" to="/register">
                    Créer un compte
                  </Link>
                  <Link className="btn btn--secondary btn--lg" to="/login">
                    Connexion
                  </Link>
                </>
              )}
              <button type="button" className="btn btn--ghost" aria-pressed={isDark} onClick={toggleTheme}>
                {isDark ? <Sun className="icon" aria-hidden="true" /> : <Moon className="icon" aria-hidden="true" />}
                {isDark ? 'Thème clair' : 'Thème sombre'}
              </button>
            </div>
          </div>
        </div>
      )}

      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <Brand />
              <address>
                <span>Centre de formation professionnelle</span>
              </address>
            </div>
            <nav aria-label="Formations">
              <h2>Formations</h2>
              <ul>
                {(Object.keys(CATEGORY_LABELS) as CategoryId[]).map((id) => (
                  <li key={id}>
                    <Link to={`/formations?cat=${id}`}>{CATEGORY_LABELS[id]}</Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Le centre">
              <h2>Le centre</h2>
              <ul>
                <li>
                  <Link to="/faq">Questions fréquentes</Link>
                </li>
                <li>
                  <Link to="/contact">Contact</Link>
                </li>
                {space ? (
                  <li>
                    <Link to={space}>Mon espace</Link>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link to="/login">Connexion</Link>
                    </li>
                    <li>
                      <Link to="/register">Créer un compte</Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
            <nav aria-label="Informations légales">
              <h2>Informations</h2>
              <ul>
                <li>
                  <Link to="/mentions-legales">Mentions légales</Link>
                </li>
                <li>
                  <Link to="/mentions-legales#confidentialite">Confidentialité</Link>
                </li>
                <li>
                  <Link to="/mentions-legales#cgu">Conditions d'utilisation</Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="footer-bottom">
            <span>© 2026 EduPortal — Centre de formation professionnelle</span>
          </div>
        </div>
      </footer>

      <button type="button" className="to-top" aria-label="Retour en haut de la page" hidden={!showTop} onClick={backToTop}>
        <ArrowUp className="icon" aria-hidden="true" />
      </button>
    </div>
  );
}
