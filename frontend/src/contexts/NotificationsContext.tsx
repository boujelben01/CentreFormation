import { createContext, useCallback, useContext, useMemo, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsApi } from '@/services/api';
import { getApiErrorMessage } from '@/lib/errors';
import type { Notification } from '@/types/api';

export interface AppNotification extends Notification {
  unread: boolean;
}

interface NotificationsContextType {
  /** Plus récentes d'abord. */
  items: AppNotification[];
  /** Compteur du serveur (GET /notifications/unread-count). */
  unreadCount: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  markRead: (id: number) => void;
  markAllRead: () => void;
  /** Chemin de la page « Toutes les notifications » de l'espace courant. */
  pagePath: string;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user, isFormateur } = useAuth();
  const queryClient = useQueryClient();
  const role = isFormateur ? 'formateur' : 'etudiant';
  const enabled = !!user;

  const listKey = useMemo(() => ['notifications', role, 'list'] as const, [role]);
  const countKey = useMemo(() => ['notifications', role, 'count'] as const, [role]);

  const list = useQuery({
    queryKey: listKey,
    queryFn: async () => (await notificationsApi.list(role)).data,
    enabled,
    staleTime: 30_000,
  });

  // Le compteur est rafraîchi régulièrement : une notification peut arriver à tout moment.
  const count = useQuery({
    queryKey: countKey,
    queryFn: async () => (await notificationsApi.unreadCount(role)).data.count,
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const readOne = useMutation({
    mutationFn: async (id: number) => (await notificationsApi.markRead(role, id)).data,
    onSuccess: (updated) => {
      queryClient.setQueryData<Notification[]>(listKey, (current) =>
        current?.map((n) => (n.id === updated.id ? { ...n, lu: true } : n)),
      );
      queryClient.invalidateQueries({ queryKey: countKey });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Impossible de marquer la notification comme lue.')),
  });

  const readAll = useMutation({
    mutationFn: async () => (await notificationsApi.markAllRead(role)).data,
    onSuccess: () => {
      queryClient.setQueryData<Notification[]>(listKey, (current) => current?.map((n) => ({ ...n, lu: true })));
      queryClient.setQueryData<number>(countKey, 0);
      toast.success('Toutes les notifications sont marquées comme lues.');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Impossible de marquer les notifications comme lues.')),
  });

  const items = useMemo<AppNotification[]>(
    () =>
      (list.data ?? [])
        .map((n) => ({ ...n, unread: !n.lu }))
        .sort((a, b) => new Date(b.dateEnvoi).getTime() - new Date(a.dateEnvoi).getTime()),
    [list.data],
  );

  const markRead = useCallback((id: number) => readOne.mutate(id), [readOne]);
  const markAllRead = useCallback(() => readAll.mutate(), [readAll]);
  const refetch = useCallback(() => {
    void list.refetch();
    void count.refetch();
  }, [list, count]);

  const value: NotificationsContextType = {
    items,
    unreadCount: count.data ?? items.filter((n) => n.unread).length,
    isLoading: list.isLoading,
    isError: list.isError,
    refetch,
    markRead,
    markAllRead,
    pagePath: `/${role}/notifications`,
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications doit être utilisé dans un NotificationsProvider');
  }
  return context;
}
