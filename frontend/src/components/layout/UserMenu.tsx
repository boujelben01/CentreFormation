import { useRef, type KeyboardEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';
import { UserAvatar } from '@/components/shared';
import { useAuth } from '@/contexts/AuthContext';
import { useIdentity } from '@/hooks/use-identity';
import { ROLE_SHELL } from './navConfig';
import { useOverlay, type OverlayName } from './useOverlay';

const ITEMS = '[role="menuitem"]';

interface UserMenuProps {
  overlay: OverlayName | null;
  setOverlay: (value: OverlayName | null) => void;
}

/** Menu avatar (composant « user-menu » de la maquette) : nom, rôle, Mon profil, Se déconnecter. */
export function UserMenu({ overlay, setOverlay }: UserMenuProps) {
  const { wrapRef, buttonRef, open, close } = useOverlay('user', overlay, setOverlay);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { fullName, roleLabel } = useIdentity();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();

  const profilePath = `${ROLE_SHELL[user?.role ?? 'ETUDIANT'].home}/profile`;
  const accountLabel = fullName ? `Menu du compte, ${fullName}, ${roleLabel}` : `Menu du compte, ${roleLabel}`;

  const items = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>(ITEMS) ?? []);

  const openMenu = (which: 'first' | 'last') => {
    setOverlay('user');
    // Le menu est rendu non masqué au tick suivant : on y place le focus à ce moment.
    requestAnimationFrame(() => {
      const list = items();
      (which === 'last' ? list[list.length - 1] : list[0])?.focus();
    });
  };

  const onButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      openMenu('first');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openMenu('last');
    }
  };

  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      list[(index + 1) % list.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      list[(index - 1 + list.length) % list.length]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      list[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      list[list.length - 1]?.focus();
    } else if (e.key === 'Tab') {
      close(true);
    }
  };

  const handleLogout = () => {
    close(false);
    logout();
    queryClient.clear();
    navigate('/login', { replace: true });
    toast.success('Vous êtes déconnecté');
  };

  return (
    <div className="popover-wrap" id="user-wrap" ref={wrapRef}>
      <button
        type="button"
        ref={buttonRef}
        className="user-menu__btn"
        id="user-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="user-menu"
        aria-label={accountLabel}
        onClick={() => (open ? close(true) : openMenu('first'))}
        onKeyDown={onButtonKeyDown}
      >
        <UserAvatar name={fullName} size="sm" />
        <span className="user-menu__id" aria-hidden="true">
          {fullName && <strong>{fullName}</strong>}
          <small>{roleLabel}</small>
        </span>
        <ChevronDown className="icon icon--sm user-menu__chev" aria-hidden="true" />
      </button>

      <div className="menu" id="user-menu" role="menu" aria-labelledby="user-btn" hidden={!open} ref={menuRef} onKeyDown={onMenuKeyDown}>
        <div className="menu__head" aria-hidden="true">
          {fullName && <strong>{fullName}</strong>}
          <small>{roleLabel}</small>
        </div>
        <Link
          className="menu__item"
          role="menuitem"
          tabIndex={-1}
          to={profilePath}
          aria-current={pathname === profilePath ? 'page' : undefined}
          onClick={() => close(false)}
        >
          <User className="icon" aria-hidden="true" />
          <span>Mon profil</span>
        </Link>
        <div className="menu__sep" role="separator" />
        <button type="button" className="menu__item menu__item--danger" role="menuitem" tabIndex={-1} onClick={handleLogout}>
          <LogOut className="icon" aria-hidden="true" />
          <span>Se déconnecter</span>
        </button>
      </div>
    </div>
  );
}
