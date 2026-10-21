import { useEffect, useRef, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Mail } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationsContext';
import { formatDateTime } from '@/lib/text';
import { cn } from '@/lib/utils';
import { useOverlay, type OverlayName } from './useOverlay';

const ITEMS = 'a[href], button:not([disabled])';

interface NotificationBellProps {
  overlay: OverlayName | null;
  setOverlay: (value: OverlayName | null) => void;
}

/** Cloche : pastille de non lues et panneau des 5 dernières notifications (composants « notif-bell » / « notif-panel »). */
export function NotificationBell({ overlay, setOverlay }: NotificationBellProps) {
  const { wrapRef, buttonRef, open, close } = useOverlay('bell', overlay, setOverlay);
  const panelRef = useRef<HTMLDivElement>(null);
  const { items, unreadCount, isLoading, isError, refetch, markRead, markAllRead, pagePath } = useNotifications();
  const latest = items.slice(0, 5);

  const label =
    unreadCount > 0
      ? `Notifications, ${unreadCount} ${unreadCount > 1 ? 'non lues' : 'non lue'}`
      : 'Notifications, aucune non lue';

  // À l'ouverture, le focus va à la première notification (sinon au premier contrôle, sinon au panneau).
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const target = panel.querySelector<HTMLElement>('[data-notif-id]') ?? panel.querySelector<HTMLElement>(ITEMS) ?? panel;
    if (target === panel) panel.setAttribute('tabindex', '-1');
    target.focus();
  }, [open]);

  const toggle = () => (open ? close(true) : setOverlay('bell'));

  const onButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setOverlay('bell');
    }
  };

  const onPanelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const controls = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(ITEMS) ?? []);
    const index = controls.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      controls[(index + 1) % controls.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      controls[(index - 1 + controls.length) % controls.length]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      controls[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      controls[controls.length - 1]?.focus();
    }
  };

  return (
    <div
      className="popover-wrap popover-wrap--wide"
      id="bell-wrap"
      ref={wrapRef}
      onBlur={(e) => {
        // Le focus sort du bloc : on ferme sans le rendre au bouton.
        if (open && e.relatedTarget && !wrapRef.current?.contains(e.relatedTarget as Node)) close(false);
      }}
    >
      <button
        type="button"
        ref={buttonRef}
        className="icon-btn bell-btn"
        id="bell"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="notif-panel"
        aria-label={label}
        onClick={toggle}
        onKeyDown={onButtonKeyDown}
      >
        <Bell className="icon" aria-hidden="true" />
        <span className="count js-unread" aria-hidden="true" hidden={unreadCount === 0}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      </button>

      <div className="popover" id="notif-panel" role="dialog" aria-label="Notifications récentes" hidden={!open} ref={panelRef} onKeyDown={onPanelKeyDown}>
        <div className="popover__head">
          <h2>Notifications</h2>
          <button type="button" className="btn btn--ghost btn--sm" disabled={unreadCount === 0} onClick={markAllRead}>
            <Check className="icon icon--sm" aria-hidden="true" />
            Tout marquer comme lu
          </button>
        </div>

        {isLoading ? (
          <div className="popover__empty" role="status">
            Chargement des notifications…
          </div>
        ) : isError ? (
          <div className="popover__empty" role="alert">
            <p>Impossible de charger les notifications.</p>
            <button type="button" className="btn btn--secondary btn--sm" style={{ marginTop: 'var(--space-3)' }} onClick={refetch}>
              Réessayer
            </button>
          </div>
        ) : latest.length === 0 ? (
          <div className="popover__empty">
            <Bell className="icon" aria-hidden="true" />
            Aucune notification pour le moment.
          </div>
        ) : (
          <ul className="popover__list">
            {latest.map((n) => {
              const isMail = n.type === 'EMAIL';
              const Icon = isMail ? Mail : Bell;
              return (
                <li key={n.id}>
                  <Link
                    className={cn('pop-item', n.unread ? 'is-unread' : 'is-read')}
                    to={`${pagePath}#notif-${n.id}`}
                    data-notif-id={n.id}
                    onClick={() => {
                      if (n.unread) markRead(n.id);
                      close(false);
                    }}
                  >
                    <span className={cn('notif__icon', isMail ? 'notif__icon--info' : 'notif__icon--primary')}>
                      <Icon className="icon" aria-hidden="true" />
                    </span>
                    <span className="pop-item__body">
                      <strong>
                        {n.sujet}
                        {n.unread && <span className="sr-only"> (non lue)</span>}
                      </strong>
                      <small>{formatDateTime(n.dateEnvoi)}</small>
                    </span>
                    <span className="pop-item__dot" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div className="popover__foot">
          <Link className="link-inline text-small" id="notif-all" to={pagePath} onClick={() => close(false)}>
            Voir toutes les notifications
          </Link>
          <span className="text-small muted" aria-hidden="true">
            {unreadCount > 0 ? `${unreadCount} ${unreadCount > 1 ? 'non lues' : 'non lue'}` : 'À jour'}
          </span>
        </div>
      </div>
    </div>
  );
}
