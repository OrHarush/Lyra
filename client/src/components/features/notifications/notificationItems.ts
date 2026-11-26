import { ComponentType } from 'react';

import BillApprovalNotificationItem from '@/components/features/notifications/BillApprovalNotificationItem';
import { NotificationDto, NotificationItemProps } from '@/types/Notification';

// A new notification type needs only an entry here, mapping it to the component that shows it.
export const NOTIFICATION_ITEMS: {
  [Type in NotificationDto['type']]: ComponentType<NotificationItemProps<Type>>;
} = {
  billApproval: BillApprovalNotificationItem,
};
