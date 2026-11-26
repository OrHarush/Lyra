import { NOTIFICATION_ITEMS } from '@/components/features/notifications/notificationItems';
import { queryKeys } from '@/constants/queryKeys';
import { API_ROUTES } from '@/constants/Routes';
import { useFetch } from '@/hooks/common/useFetch';
import { NotificationDto } from '@/types/Notification';

export const useNotifications = () => {
  const query = useFetch<NotificationDto[]>({
    url: API_ROUTES.NOTIFICATIONS,
    queryKey: queryKeys.notifications(),
    staleTime: 0,
  });

  // A cached app can be older than the server, and must not count what it can't show.
  const notifications = (query.data ?? []).filter(({ type }) => type in NOTIFICATION_ITEMS);

  return {
    ...query,
    actions: notifications.filter(({ section }) => section === 'action'),
    updates: notifications.filter(({ section }) => section === 'update'),
  };
};
