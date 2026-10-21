import { Bell, Check, Mail } from 'lucide-react';
import { notificationTypeLabel } from '@/lib/labels';
import { formatDateTime } from '@/lib/text';
import type { AppNotification } from '@/contexts/NotificationsContext';

interface NotificationListProps {
  items: AppNotification[];
  onMarkRead: (id: number) => void;
}

/** Liste des notifications (composants « notification-item » et `.notif-list` de la maquette). */
export default function NotificationList({ items, onMarkRead }: NotificationListProps) {
  return (
    <ul className="notif-list">
      {items.map((n) => {
        const isEmail = n.type === 'EMAIL';
        const Icon = isEmail ? Mail : Bell;
        return (
          <li key={n.id}>
            <article
              className={`card notif ${n.unread ? 'is-unread' : 'is-read'}`}
              id={`notif-${n.id}`}
              aria-label={`${n.unread ? 'Non lue : ' : ''}${n.sujet}`}
            >
              <span className={`notif__icon notif__icon--${isEmail ? 'info' : 'primary'}`}>
                <Icon className="icon" aria-hidden="true" />
              </span>
              <div>
                <h3>
                  {n.sujet}
                  {n.type && <span className={`badge badge--${isEmail ? 'info' : 'primary'}`}>{notificationTypeLabel(n.type)}</span>}
                  {n.unread && <span className="badge badge--primary">Non lue</span>}
                </h3>
                <p>{n.message}</p>
                <div className="notif__foot">
                  <span>{formatDateTime(n.dateEnvoi)}</span>
                  {n.unread ? (
                    <button type="button" className="btn btn--ghost" onClick={() => onMarkRead(n.id)}>
                      <Check className="icon icon--sm" aria-hidden="true" />
                      Marquer comme lu
                    </button>
                  ) : (
                    <span>
                      <Check className="icon icon--sm" aria-hidden="true" /> Lue
                    </span>
                  )}
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
