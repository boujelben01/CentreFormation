import { useRef, useState } from 'react';
import { Bell, Check, CheckCircle } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { PageHeader } from './PageHeader';
import { PageState } from './PageState';
import NotificationList from './NotificationList';
import { useNotifications } from '@/contexts/NotificationsContext';

type Filter = 'toutes' | 'non-lues';

/** Page « Notifications » des deux espaces (état lu/non lu persisté côté serveur). */
export default function NotificationsPage() {
  const { items, unreadCount, isLoading, isError, refetch, markRead, markAllRead } = useNotifications();
  const [filter, setFilter] = useState<Filter>('toutes');
  const titleRef = useRef<HTMLHeadingElement>(null);
  const visible = filter === 'non-lues' ? items.filter((n) => n.unread) : items;
  const ready = !isLoading && !isError;

  let subtitle = '';
  if (ready) {
    subtitle =
      unreadCount > 0
        ? `${unreadCount} ${unreadCount > 1 ? 'notifications non lues' : 'notification non lue'} sur ${items.length}.`
        : 'Vous êtes à jour : aucune notification non lue.';
  }

  const read = (id: number) => {
    markRead(id);
    titleRef.current?.focus();
  };
  const readAll = () => {
    markAllRead();
    titleRef.current?.focus();
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Notifications"
        subtitle={subtitle}
        actions={
          <button type="button" className="btn btn--secondary" disabled={!ready || unreadCount === 0} onClick={readAll}>
            <Check className="icon" aria-hidden="true" />
            Tout marquer comme lu
          </button>
        }
      />

      <PageState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        errorWhat="vos notifications"
        isEmpty={items.length === 0}
        empty={
          <EmptyState
            icon={Bell}
            title="Aucune notification"
            description="Vous serez prévenu ici dès qu'une information vous concerne."
          />
        }
      >
        <section className="card card--pad" aria-labelledby="nf-title">
          <div className="panel-title">
            <h2 id="nf-title" tabIndex={-1} ref={titleRef}>
              {filter === 'non-lues' ? 'Notifications non lues' : 'Toutes les notifications'}
            </h2>
            <div className="seg" role="group" aria-label="Filtrer les notifications">
              <button type="button" aria-pressed={filter === 'toutes'} onClick={() => setFilter('toutes')}>
                Toutes<span className="sr-only"> ({items.length})</span>
              </button>
              <button type="button" aria-pressed={filter === 'non-lues'} onClick={() => setFilter('non-lues')}>
                Non lues<span className="sr-only"> ({unreadCount})</span>
                <span aria-hidden="true"> ({unreadCount})</span>
              </button>
            </div>
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {visible.length} {visible.length > 1 ? 'notifications affichées' : 'notification affichée'}.
          </p>
          {visible.length > 0 ? (
            <NotificationList items={visible} onMarkRead={read} />
          ) : (
            <div className="callout" role="status">
              <CheckCircle className="icon" aria-hidden="true" />
              <span>Vous êtes à jour : aucune notification non lue.</span>
            </div>
          )}
        </section>
      </PageState>
    </div>
  );
}
